"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { MoreVertical, UserPlus, Crown, Shield, User } from "lucide-react"

interface Member {
  user: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  role: string
  status: string
  addedBy: string
}

interface TripMembersProps {
  tripId: string
  members: Member[]
  isAuthor: boolean
  onUpdate: () => void
}

export default function TripMembers({ tripId, members, isAuthor, onUpdate }: TripMembersProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [newMember, setNewMember] = useState("")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddMember = async () => {
    if (!newMember.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email or username",
        variant: "destructive",
      })
      return
    }

    setIsAddingMember(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newMember }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add member")
      }

      toast({
        title: "Member added",
        description: `Invitation sent with status: ${data.status}`,
      })

      setNewMember("")
      setIsDialogOpen(false)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Failed to add member",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleMemberAction = async (memberId: string, action: string, role?: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update member")
      }

      toast({
        title: "Success",
        description: data.message,
      })

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "author":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "co_leader":
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Accepted
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "invited":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Invited
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Members</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Enter the email or username of the person you want to add to this trip.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input placeholder="Email or username" value={newMember} onChange={(e) => setNewMember(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={isAddingMember}>
                {isAddingMember ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.user._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.user.profileImage} alt={member.user.name} />
                    <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{member.user.name}</h3>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(member.status)}

                  {/* Self actions for invited members */}
                  {member.user._id === session?.user.id && member.status === "invited" && (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleMemberAction(member.user._id, "accept")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleMemberAction(member.user._id, "reject")}>
                        Decline
                      </Button>
                    </div>
                  )}

                  {/* Author actions for other members */}
                  {isAuthor && member.user._id !== session?.user.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {member.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleMemberAction(member.user._id, "approve")}>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMemberAction(member.user._id, "reject")}>
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}

                        {member.status === "accepted" && (
                          <>
                            {member.role === "participant" ? (
                              <DropdownMenuItem onClick={() => handleMemberAction(member.user._id, "", "co_leader")}>
                                Make Co-Leader
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleMemberAction(member.user._id, "", "participant")}
                              >
                                Remove Co-Leader
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                          </>
                        )}

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleMemberAction(member.user._id, "remove")}
                        >
                          Remove from Trip
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

