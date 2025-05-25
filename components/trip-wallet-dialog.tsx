"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, AlertCircle, CheckCircle2, XCircle, Users, Check, ThumbsUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";


interface TripWalletDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tripId: string;
}


interface WalletDetails {
    balance: number;
    pendingWithdrawal: boolean;
    approvals: number;
    totalMembers: number;
    votingThreshold: number;
    hasVoted: boolean;
    isAuthor: boolean;
}

export default function TripWalletDialog({
    open,
    onOpenChange,
    tripId,
}: TripWalletDialogProps) {
    const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [initiatingWithdrawal, setInitiatingWithdrawal] = useState(false);
    const [voting, setVoting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const { toast } = useToast();

    // Fetch wallet details when dialog opens
    useEffect(() => {
        if (open) {
            fetchWalletDetails();
        }
    }, [open, tripId]);

    const fetchWalletDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/trips/${tripId}/wallet`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to load wallet details");
            }

            setWalletDetails(data.walletDetails);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const initiateWithdrawal = async () => {
        try {
            setInitiatingWithdrawal(true);
            const response = await fetch(`/api/trips/${tripId}/wallet`, {
                method: "POST",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to initiate withdrawal");
            }

            toast({
                title: "Success",
                description: "Withdrawal request initiated. Waiting for members to vote.",
            });
            fetchWalletDetails();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setInitiatingWithdrawal(false);
        }
    };

    const voteForWithdrawal = async () => {
        try {
            setVoting(true);
            const response = await fetch(`/api/trips/${tripId}/wallet`, {
                method: "PUT",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit vote");
            }

            // Check if the withdrawal was approved and processed
            if (data.status === "approved") {
                toast({
                    title: "Withdrawal Approved",
                    description: "The withdrawal has been approved and funds transferred to the trip author.",
                });
            } else {
                toast({
                    title: "Vote Submitted",
                    description: "Your vote has been recorded.",
                });
            }

            fetchWalletDetails();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setVoting(false);
        }
    };

    const cancelWithdrawal = async () => {
        try {
            setCancelling(true);
            const response = await fetch(`/api/trips/${tripId}/wallet`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to cancel withdrawal request");
            }

            toast({
                title: "Success",
                description: "Withdrawal request cancelled.",
            });
            fetchWalletDetails();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setCancelling(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                        <Wallet className="w-5 h-5 mr-2 text-blue-500" />
                        Trip Wallet
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400 mt-2">
                        Manage the trip funds collected from expense payments.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 flex flex-col items-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="mt-4 text-gray-500">Loading wallet details...</p>
                    </div>
                ) : walletDetails ? (
                    <div className="space-y-6 py-2">
                        {/* Wallet Balance */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Trip Balance</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(walletDetails.balance)}</p>
                            <p className="text-xs text-gray-500 mt-1">Available for withdrawal</p>
                        </div>

                        {walletDetails.pendingWithdrawal ? (
                            <div className="space-y-4">
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/20 rounded-xl p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-amber-700 dark:text-amber-400">Withdrawal Request Pending</h3>
                                            <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                                                The trip author has requested to withdraw {formatCurrency(walletDetails.balance)} from the trip wallet.
                                                This requires approval from at least {walletDetails.votingThreshold} members.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{walletDetails.approvals} of {walletDetails.totalMembers} votes</span>
                                            <span>{walletDetails.approvals}/{walletDetails.votingThreshold} required</span>
                                        </div>
                                        <Progress value={(walletDetails.approvals / walletDetails.votingThreshold) * 100} className="h-2" />
                                    </div>

                                    <div className="mt-4 flex justify-center">
                                        {walletDetails.isAuthor ? (
                                            <>
                                                {walletDetails.approvals >= walletDetails.votingThreshold ? (
                                                    <Button
                                                        className="rounded-full mt-2 bg-green-500 hover:bg-green-600 text-white"
                                                        onClick={async () => {
                                                            try {
                                                                const response = await fetch(`/api/trips/${tripId}/wallet/transfer`, {
                                                                    method: "POST",
                                                                });

                                                                const data = await response.json();

                                                                if (!response.ok) {
                                                                    throw new Error(data.error || "Failed to transfer funds");
                                                                }

                                                                toast({
                                                                    title: "Funds Transferred",
                                                                    description: `${formatCurrency(walletDetails.balance)} has been transferred to your wallet.`,
                                                                });

                                                                fetchWalletDetails();
                                                            } catch (error: any) {
                                                                toast({
                                                                    title: "Transfer Failed",
                                                                    description: error.message || "Failed to transfer funds to your wallet",
                                                                    variant: "destructive",
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <Wallet className="w-4 h-4 mr-2" />
                                                        Transfer Funds to Wallet
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-full mt-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={cancelWithdrawal}
                                                        disabled={cancelling}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        {cancelling ? "Cancelling..." : "Cancel Request"}
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full">
                                                {!walletDetails.hasVoted ? (
                                                    <Button
                                                        className="rounded-full mt-2 bg-green-500 hover:bg-green-600 text-white w-full"
                                                        onClick={voteForWithdrawal}
                                                        disabled={voting}
                                                    >
                                                        <ThumbsUp className="w-4 h-4 mr-2" />
                                                        {voting ? "Voting..." : "Approve Withdrawal"}
                                                    </Button>
                                                ) : (
                                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/20 rounded-xl p-3 flex items-center justify-center mt-2">
                                                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                                        <span className="text-green-700 dark:text-green-400 font-medium">You've approved this withdrawal</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : walletDetails.balance > 0 && walletDetails.isAuthor ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/20 rounded-xl p-4">
                                    <div className="flex items-start">
                                        <Users className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-blue-700 dark:text-blue-400">Author Options</h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                                As the trip author, you can initiate a withdrawal of {formatCurrency(walletDetails.balance)}. This requires approval from at least {walletDetails.votingThreshold} members.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full rounded-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                                        onClick={initiateWithdrawal}
                                        disabled={initiatingWithdrawal}
                                    >
                                        <Wallet className="w-4 h-4 mr-2" />
                                        {initiatingWithdrawal ? "Initiating..." : "Initiate Withdrawal"}
                                    </Button>
                                </div>
                            </div>
                        ) : walletDetails.balance === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No funds available for withdrawal.</p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                <p className="text-gray-500 dark:text-gray-400">Only the trip author can initiate withdrawals.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 dark:text-red-400">Failed to load wallet details</p>
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full w-full"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// https://same.new/chat/clone-httpsgithub-comvarunsingh19wanderwave-git-remix-of-remix-of-remix-of-remix-of-remix-fr5ckqttkm9

// bro still not working and i even cant see the trip wallet amount its not there pls fix and give the full code ok dont give half code bro