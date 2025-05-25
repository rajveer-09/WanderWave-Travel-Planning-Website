// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { useSession, signOut } from "next-auth/react"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   Home,
//   Map,
//   Compass,
//   Users,
//   MessageCircle,
//   User,
//   LogOut,
//   Wallet,
//   Globe,
//   ChevronRight,
//   Menu,
//   X,
// } from "lucide-react"
// import { motion } from "framer-motion"
// import { useState, useEffect } from "react"

// export default function Header() {
//   const { data: session } = useSession()
//   const pathname = usePathname()
//   const [scrolled, setScrolled] = useState(false)
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

//   // Handle scroll effect for header bg change
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 10) {
//         setScrolled(true)
//       } else {
//         setScrolled(false)
//       }
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   const isActive = (path: string) => pathname === path

//   return (
//     <>
//       <header
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${!scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-lg" : "bg-slate-900/95 backdrop-blur-md shadow-lg"
//           }`}
//       >
//         <div className="container flex items-center justify-between h-16 px-4 mx-auto">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-2">
//             <div className="relative flex items-center">
//               <Globe className="w-6 h-6 text-teal-400" />
//               <motion.div
//                 className="absolute inset-0 rounded-full border border-teal-400/30"
//                 animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
//                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//               />
//             </div>
//             <div className="flex items-baseline">
//               <span className="text-xl font-bold text-white">Wander</span>
//               <span className="text-xl font-bold text-teal-400">Wave</span>
//             </div>
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-6">
//             {session ? (
//               <>
//                 <Link
//                   href="/"
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Home className="w-4 h-4" />
//                   <span>Home</span>
//                 </Link>
//                 <Link
//                   href="/trips"
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/trips") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Map className="w-4 h-4" />
//                   <span>My Trips</span>
//                 </Link>
//                 <Link
//                   href="/explore"
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/explore") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Compass className="w-4 h-4" />
//                   <span>Explore</span>
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link href="/login" className="text-gray-300 hover:text-teal-300 transition-colors">
//                   Login
//                 </Link>
//                 <Link href="/register">
//                   <Button className="bg-teal-500 hover:bg-teal-600 text-white border-none">
//                     Sign Up
//                   </Button>
//                 </Link>
//               </>
//             )}
//           </nav>

//           {/* Mobile Menu Toggle */}
//           <div className="md:hidden flex items-center">
//             <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//               {mobileMenuOpen ? <X className="w-6 h-6 text-gray-300" /> : <Menu className="w-6 h-6 text-gray-300" />}
//             </Button>
//           </div>

//           {/* User Menu (when logged in) */}
//           {session && (
//             <div className="hidden md:block">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     className="relative w-10 h-10 rounded-full overflow-hidden border border-teal-500/30 hover:border-teal-400 transition-colors p-0"
//                   >
//                     <Avatar className="w-10 h-10">
//                       <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
//                       <AvatarFallback className="bg-teal-900 text-teal-100">
//                         {session.user.name?.charAt(0) || "W"}
//                       </AvatarFallback>
//                     </Avatar>
//                     <motion.div
//                       className="absolute inset-0 rounded-full bg-teal-400/10"
//                       animate={{ opacity: [0, 0.5, 0] }}
//                       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
//                     />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-gray-200">
//                   <DropdownMenuLabel className="text-teal-300">My Account</DropdownMenuLabel>
//                   <DropdownMenuSeparator className="bg-slate-700" />
//                   <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
//                     <Link href="/profile" className="flex items-center cursor-pointer">
//                       <User className="w-4 h-4 mr-2 text-teal-400" />
//                       Profile
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
//                     <Link href="/wallet" className="flex items-center cursor-pointer">
//                       <Wallet className="w-4 h-4 mr-2 text-teal-400" />
//                       Wallet
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
//                     <Link href="/friends" className="flex items-center cursor-pointer">
//                       <Users className="w-4 h-4 mr-2 text-teal-400" />
//                       Friends
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
//                     <Link href="/messages" className="flex items-center cursor-pointer">
//                       <MessageCircle className="w-4 h-4 mr-2 text-teal-400" />
//                       Messages
//                     </Link>
//                   </DropdownMenuItem>

//                   <DropdownMenuSeparator className="bg-slate-700" />
//                   <DropdownMenuItem
//                     onClick={() => signOut({ callbackUrl: "/" })}
//                     className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-teal-300"
//                   >
//                     <LogOut className="w-4 h-4 mr-2 text-teal-400" />
//                     Sign Out
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           )}
//         </div>
//       </header>

//       {/* Mobile Navigation Menu */}
//       {mobileMenuOpen && (
//         <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md shadow-lg z-40">
//           <nav className="flex flex-col space-y-2 p-4">
//             {session ? (
//               <>
//                 <Link
//                   href="/"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Home className="w-4 h-4" />
//                   <span>Home</span>
//                 </Link>
//                 <Link
//                   href="/profile"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/trips") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <User className="w-4 h-4" />
//                   <span>Profile</span>
//                 </Link>
//                 <Link
//                   href="/wallet"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/trips") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Wallet className="w-4 h-4" />
//                   <span>Wallet</span>
//                 </Link>
//                 <Link
//                   href="/trips"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/trips") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Map className="w-4 h-4" />
//                   <span>My Trips</span>
//                 </Link>
//                 <Link
//                   href="/explore"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/explore") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Compass className="w-4 h-4" />
//                   <span>Explore</span>
//                 </Link>
//                 <Link
//                   href="/friends"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/friends") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <Users className="w-4 h-4" />
//                   <span>Friends</span>
//                 </Link>
//                 <Link
//                   href="/messages"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`flex items-center space-x-1 transition-colors ${isActive("/messages") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
//                     }`}
//                 >
//                   <MessageCircle className="w-4 h-4" />
//                   <span>Messages</span>
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link
//                   href="/login"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="text-gray-300 hover:text-teal-300 transition-colors"
//                 >
//                   Login
//                 </Link>
//                 <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
//                   <Button className="bg-teal-500 hover:bg-teal-600 text-white border-none">
//                     Sign Up
//                   </Button>
//                 </Link>
//               </>
//             )}
//           </nav>
//         </div>
//       )}
//     </>
//   )
// }
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Map,
  Compass,
  Users,
  MessageCircle,
  User,
  LogOut,
  Wallet,
  Globe,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [windowHeight, setWindowHeight] = useState(0)
  const [menuPosition, setMenuPosition] = useState("top-16")
  const headerRef = useRef<HTMLDivElement>(null)

  // Handle window size for mobile menu positioning
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    // Initial setup
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle scroll effect for header bg change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      // Determine if we should show menu upward or downward
      if (headerRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - headerRect.bottom

        // If there's not enough space below for the menu, position it above
        if (spaceBelow < 300 && window.innerHeight > 500) {
          setMenuPosition("bottom-16")
        } else {
          setMenuPosition("top-16")
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (path: string) => pathname === path

  // Animation variants for menu items
  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, y: -5, transition: { duration: 0.2 } }
  }

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${!scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-lg" : "bg-slate-900/95 backdrop-blur-md shadow-lg"
          }`}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container flex items-center justify-between h-16 px-4 mx-auto"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              className="relative flex items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Globe className="w-6 h-6 text-teal-400" />
              <motion.div
                className="absolute inset-0 rounded-full border border-teal-400/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <div className="flex items-baseline">
              <motion.span
                className="text-xl font-bold text-white"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Wander
              </motion.span>
              <motion.span
                className="text-xl font-bold text-teal-400"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Wave
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {session ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/"
                    className={`flex items-center space-x-1 transition-colors ${isActive("/") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
                      }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/trips"
                    className={`flex items-center space-x-1 transition-colors ${isActive("/trips") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
                      }`}
                  >
                    <Map className="w-4 h-4" />
                    <span>My Trips</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/explore"
                    className={`flex items-center space-x-1 transition-colors ${isActive("/explore") ? "text-teal-400 font-medium" : "text-gray-300 hover:text-teal-300"
                      }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore</span>
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/login" className="text-gray-300 hover:text-teal-300 transition-colors">
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white border-none">
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-teal-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>

          {/* User Menu (when logged in) */}
          {session && (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      className="relative w-10 h-10 rounded-full overflow-hidden border border-teal-500/30 hover:border-teal-400 transition-colors p-0"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback className="bg-teal-900 text-teal-100">
                          {session.user.name?.charAt(0) || "W"}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute inset-0 rounded-full bg-teal-400/10"
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                      />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-gray-200">
                  <DropdownMenuLabel className="text-teal-300">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="w-4 h-4 mr-2 text-teal-400" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
                    <Link href="/wallet" className="flex items-center cursor-pointer">
                      <Wallet className="w-4 h-4 mr-2 text-teal-400" />
                      Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
                    <Link href="/friends" className="flex items-center cursor-pointer">
                      <Users className="w-4 h-4 mr-2 text-teal-400" />
                      Friends
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-slate-700 focus:text-teal-300">
                    <Link href="/messages" className="flex items-center cursor-pointer">
                      <MessageCircle className="w-4 h-4 mr-2 text-teal-400" />
                      Messages
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-teal-300"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-teal-400" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </motion.div>
      </header>

      {/* Mobile Navigation Menu with AnimatePresence for smooth enter/exit animations */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={`md:hidden fixed ${menuPosition} left-0 right-0 bg-slate-900/95 backdrop-blur-md shadow-lg z-40 max-h-screen overflow-auto`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <nav className="flex flex-col space-y-2 p-4">
              {session ? (
                <>
                  <motion.div custom={0} variants={menuItemVariants}>
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1 transition-colors p-2 rounded-md ${isActive("/") ? "text-teal-400 font-medium bg-slate-800/70" : "text-gray-300 hover:text-teal-300 hover:bg-slate-800/50"
                        }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </Link>
                  </motion.div>

                  <motion.div custom={1} variants={menuItemVariants}>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1 transition-colors p-2 rounded-md ${isActive("/profile") ? "text-teal-400 font-medium bg-slate-800/70" : "text-gray-300 hover:text-teal-300 hover:bg-slate-800/50"
                        }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </motion.div>

                  <motion.div custom={2} variants={menuItemVariants}>
                    <Link
                      href="/wallet"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1 transition-colors p-2 rounded-md ${isActive("/wallet") ? "text-teal-400 font-medium bg-slate-800/70" : "text-gray-300 hover:text-teal-300 hover:bg-slate-800/50"
                        }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Wallet</span>
                    </Link>
                  </motion.div>

                  <motion.div custom={3} variants={menuItemVariants}>
                    <Link
                      href="/trips"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1 transition-colors p-2 rounded-md ${isActive("/trips") ? "text-teal-400 font-medium bg-slate-800/70" : "text-gray-300 hover:text-teal-300 hover:bg-slate-800/50"
                        }`}
                    >
                      <Map className="w-4 h-4" />
                      <span>My Trips</span>
                    </Link>
                  </motion.div>

                  <motion.div custom={4} variants={menuItemVariants}>
                    <Link
                      href="/explore"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1 transition-colors p-2 rounded-md ${isActive("/explore") ? "text-teal-400 font-medium bg-slate-800/70" : "text-gray-300 hover:text-teal-300 hover:bg-slate-800/50"
                        }`}
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore</span>
                    </Link>
                  </motion.div>

                  <motion.div custom={5} variants={menuItemVariants}>
                    <Link
                      href="/friends"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1 transition-colors p-2 rounded-md ${isActive("/friends") ? "text-teal-400 font-medium bg-slate-800/70" : "text-gray-300 hover:text-teal-300 hover:bg-slate-800/50"
                        }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Friends</span>
                    </Link>
                  </motion.div>

                  <motion.div custom={6} variants={menuItemVariants}>
                    <Link
                      href="/messages"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1 transition-colors p-2 rounded-md ${isActive("/messages") ? "text-teal-400 font-medium bg-slate-800/70" : "text-gray-300 hover:text-teal-300 hover:bg-slate-800/50"
                        }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Messages</span>
                    </Link>
                  </motion.div>

                  <motion.div custom={7} variants={menuItemVariants}>
                    <Button
                      onClick={() => {
                        signOut({ callbackUrl: "/" })
                        setMobileMenuOpen(false)
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 flex items-center justify-center space-x-2 mt-2"
                    >
                      <LogOut className="w-4 h-4 text-teal-400" />
                      <span>Sign Out</span>
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div custom={0} variants={menuItemVariants}>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-300 hover:text-teal-300 transition-colors block p-2 rounded-md hover:bg-slate-800/50"
                    >
                      Login
                    </Link>
                  </motion.div>

                  <motion.div custom={1} variants={menuItemVariants} className="mt-2">
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                      <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white border-none">
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}