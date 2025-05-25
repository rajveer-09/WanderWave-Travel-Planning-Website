import type { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocket = (
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server);

    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      try {
        // Verify token
        const user = await getToken({
          req: {
            headers: { cookie: `next-auth.session-token=${token}` },
          } as any,
        });

        if (!user) {
          return next(new Error("Authentication error"));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join-trip", (tripId) => {
        socket.join(`trip:${tripId}`);
        console.log(`Socket ${socket.id} joined trip:${tripId}`);
      });

      socket.on("leave-trip", (tripId) => {
        socket.leave(`trip:${tripId}`);
        console.log(`Socket ${socket.id} left trip:${tripId}`);
      });

      socket.on("send-message", async (data) => {
        const { tripId, content } = data;
        const user = socket.data.user;

        if (!user || !tripId || !content) {
          return;
        }

        try {
          // Save message to database (implementation in route handler)

          // Broadcast to all members in the trip
          io.to(`trip:${tripId}`).emit("new-message", {
            tripId,
            content,
            sender: user.id,
            createdAt: new Date(),
          });
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
};
