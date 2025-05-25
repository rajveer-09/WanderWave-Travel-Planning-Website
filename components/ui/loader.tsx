"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence, useAnimation, type Variants } from "framer-motion"
import { useWindowSize } from "react-use"

// Animated globe component
const AnimatedGlobe = () => {
    // Create a grid of dots to represent a simplified globe
    const rows = 8
    const columns = 16
    const dotSize = 3

    // Function to calculate if a dot should be visible based on its position
    const shouldShowDot = (row: number, col: number) => {
        // Create a sphere-like pattern by using distance from center
        const centerRow = rows / 2 - 0.5
        const centerCol = columns / 2 - 0.5
        const normalizedRow = (row - centerRow) / (rows / 2)
        const normalizedCol = (col - centerCol) / (columns / 2)
        const distance = Math.sqrt(normalizedRow * normalizedRow + normalizedCol * normalizedCol)

        return distance <= 1
    }

    return (
        <motion.div
            className="relative w-40 h-40 mx-auto"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute inset-0 rounded-full bg-teal-500/20 filter blur-md" />

            {Array.from({ length: rows }).map((_, rowIndex) => (
                Array.from({ length: columns }).map((_, colIndex) => (
                    shouldShowDot(rowIndex, colIndex) && (
                        <motion.div
                            key={`dot-${rowIndex}-${colIndex}`}
                            className="absolute bg-teal-100"
                            style={{
                                width: dotSize,
                                height: dotSize,
                                borderRadius: '50%',
                                left: `${(colIndex / columns) * 100}%`,
                                top: `${(rowIndex / rows) * 100}%`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 3,
                                delay: (rowIndex + colIndex) * 0.05,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    )
                ))
            ))}

            {/* Orbit rings */}
            <motion.div
                className="absolute inset-0 border border-teal-200/30 rounded-full"
                style={{ margin: '-10px' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
                className="absolute inset-0 border border-teal-200/20 rounded-full"
                style={{ margin: '-20px' }}
                animate={{ rotate: -180 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
        </motion.div>
    )
}

// Floating destination tags
const DestinationTags = () => {
    const destinations = [
        "Manali", "Goa", "Jaipur", "Leh", "Kerala",
        "Rishikesh", "Udaipur", "Darjeeling", "Andaman Islands", "Mysore"
    ];


    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {destinations.map((city, index) => {
                // Random positions distributed around the center
                const angle = (index / destinations.length) * Math.PI * 2
                const radius = 150 + Math.random() * 100
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                return (
                    <motion.div
                        key={city}
                        className="absolute text-teal-100/60 text-xs font-light"
                        style={{
                            left: 'calc(50% + 0px)',
                            top: 'calc(50% + 0px)',
                            x, y,
                            originX: 0.5,
                            originY: 0.5,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 0.8, 0],
                            scale: [0.8, 1, 0.8],
                            x: [x, x + (Math.random() * 30 - 15)],
                            y: [y, y + (Math.random() * 30 - 15)],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 3,
                            delay: index * 0.3,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 5,
                        }}
                    >
                        {city}
                    </motion.div>
                )
            })}
        </div>
    )
}

// Animated logo component
const AnimatedLogo = () => {
    const wordVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    }

    const letterVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.03 + 0.3,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    }

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <motion.div
                className="text-4xl md:text-6xl font-bold text-white mb-2"
                variants={wordVariants}
                custom={0}
                initial="hidden"
                animate="visible"
            >
                <span className="text-teal-300">Wander</span>
                <span className="text-white">Wave</span>
            </motion.div>

            <motion.div
                className="text-sm md:text-base text-teal-100/70 tracking-widest font-light"
                variants={wordVariants}
                custom={1}
                initial="hidden"
                animate="visible"
            >
                EXPLORE TOGETHER
            </motion.div>

            <motion.div
                className="flex justify-center mt-2 overflow-hidden h-1"
                initial={{ width: 0 }}
                animate={{ width: "80%" }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            >
                <motion.div
                    className="h-full w-full bg-gradient-to-r from-teal-500/0 via-teal-300 to-teal-500/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut"
                    }}
                />
            </motion.div>
        </div>
    )
}

// Modern loading indicator
const LoadingIndicator = ({ progress }: { progress: number }) => {
    return (
        <div className="relative w-24 h-24">
            {/* Circular progress track */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                />

                {/* Progress circle */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                    transform="rotate(-90 50 50)"
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#5eead4" />
                        <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Pulsing center */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <div className="w-12 h-12 rounded-full bg-teal-500/20 blur-sm" />
            </motion.div>

            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    className="text-white text-sm font-medium"
                    key={Math.round(progress)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {Math.round(progress)}%
                </motion.span>
            </div>
        </div>
    )
}

// Particle component with improved effects
const Particle = () => {
    const size = Math.random() * 3 + 1
    const initialX = Math.random() * 100
    const initialY = Math.random() * 100
    const duration = Math.random() * 20 + 10
    const delay = Math.random() * 2

    // Determine if this will be a shooting star (rare)
    const isShootingStar = Math.random() > 0.9

    if (isShootingStar) {
        // Shooting star animation
        return (
            <motion.div
                className="absolute rounded-full bg-white"
                style={{
                    width: size + 1,
                    height: size / 5 + 1,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 50}%`,
                    filter: "blur(0.5px)",
                    opacity: 0
                }}
                animate={{
                    x: [0, -200],
                    y: [0, 100],
                    opacity: [0, 0.8, 0],
                    width: [size, size + 10, size],
                    height: [size / 5, 2, size / 5]
                }}
                transition={{
                    duration: 1.5,
                    delay: Math.random() * 10 + 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: Math.random() * 20 + 10,
                    ease: "easeInOut",
                }}
            />
        )
    }

    // Regular star/particle
    return (
        <motion.div
            className="absolute rounded-full bg-white/50"
            style={{
                width: size,
                height: size,
                left: `${initialX}%`,
                top: `${initialY}%`,
                filter: "blur(0.5px)",
            }}
            animate={{
                scale: [1, Math.random() * 0.5 + 1, 1],
                opacity: [0.1, Math.random() * 0.5 + 0.5, 0.1],
            }}
            transition={{
                duration: Math.random() * 2 + 2,
                delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
            }}
        />
    )
}

// Loading text phrases
const loadingPhrases = [
    "Mapping your adventure...",
    "Packing digital bags...",
    "Scanning horizons...",
    "Calculating routes...",
    "Finding hidden gems...",
    "Crafting your journey...",
    "Warming up the engines...",
    "Checking the weather...",
]

// Main Loader component
export function Loader() {
    const [progress, setProgress] = useState(0)
    const [loadingPhrase, setLoadingPhrase] = useState(loadingPhrases[0])
    const controls = useAnimation()
    const { width, height } = useWindowSize()

    // Progress calculation with slight randomization for natural feel
    useEffect(() => {
        let lastUpdate = Date.now()
        let currentProgress = 0

        const getNextIncrement = () => {
            // Start slow, accelerate in the middle, slow down at the end
            if (currentProgress < 20) return Math.random() * 0.5 + 0.2
            if (currentProgress < 80) return Math.random() * 1 + 0.4
            return Math.random() * 0.3 + 0.1
        }

        const timer = setInterval(() => {
            const now = Date.now()
            const delta = now - lastUpdate

            if (delta > 150) {
                currentProgress += getNextIncrement()

                if (currentProgress >= 100) {
                    currentProgress = 100
                    clearInterval(timer)
                }

                setProgress(currentProgress)
                lastUpdate = now

                // Change phrases occasionally
                if (Math.random() > 0.9 && currentProgress < 95) {
                    const newPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]
                    setLoadingPhrase(newPhrase)
                }
            }
        }, 30)

        return () => clearInterval(timer)
    }, [])

    // Fade out animation when complete
    useEffect(() => {
        if (progress === 100) {
            setTimeout(() => {
                controls.start({
                    opacity: 0,
                    scale: 1.1,
                    transition: { duration: 0.8, ease: "easeInOut" },
                })
            }, 500)
        }
    }, [progress, controls])

    // Generate particles based on screen size
    const particleCount = Math.min(Math.floor((width * height) / 15000), 50)

    return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Dark gradient background with subtle animation */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
                animate={{
                    background: [
                        "linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)",
                        "linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)",
                    ],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />

            {/* Northern lights effect */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <motion.div
                    className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-r from-teal-500/0 via-teal-500/30 to-teal-500/0"
                    style={{ filter: "blur(40px)" }}
                    animate={{
                        x: ["-20%", "120%"],
                        y: [0, 10, 0]
                    }}
                    transition={{
                        x: { duration: 15, repeat: Infinity, ease: "linear" },
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                />
            </div>

            {/* Stars/particles */}
            {Array.from({ length: particleCount }).map((_, index) => (
                <Particle key={index} />
            ))}

            {/* Destination tags floating in background */}
            <DestinationTags />

            {/* Content container */}
            <motion.div
                className="relative z-10 flex flex-col items-center max-w-md text-center px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Animated globe above logo */}
                <div className="mb-6">
                    <AnimatedGlobe />
                </div>

                {/* Logo and tagline */}
                <div className="mb-8">
                    <AnimatedLogo />
                </div>

                {/* Loading indicator */}
                <div className="mb-6">
                    <LoadingIndicator progress={progress} />
                </div>

                {/* Loading text with phrase rotation */}
                <motion.div
                    className="text-teal-100/80 text-sm font-light tracking-wider"
                    key={loadingPhrase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {loadingPhrase}
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export function LoaderWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 3500) // Enough time for all animations to complete

        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            <AnimatePresence>
                {loading && (
                    <motion.div
                        key="loader"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Loader />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: loading ? 0 : 1,
                }}
                transition={{ duration: 0.8 }}
            >
                {children}
            </motion.div>
        </>
    )
}