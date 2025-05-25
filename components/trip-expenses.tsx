"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Wallet,
  PlusCircle,
  DollarSign,
  Receipt,
  CreditCard,
  Users,
  Check,
  Clock,
  AlertCircle,
  Divide
} from "lucide-react"

interface Expense {
  _id: string
  title: string
  description?: string
  amount: number
  date: string
  addedBy: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  shares: {
    user: {
      _id: string
      name: string
      email: string
      profileImage?: string
    }
    amount: number
    amountPaid: number
    status: string
  }[]
}

interface Member {
  user: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  role: string
  status: string
}

interface TripExpensesProps {
  tripId: string
  expenses: Expense[]
  members: Member[]
  onUpdate: () => void
}

const expenseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TripExpenses({ tripId, expenses, members, onUpdate }: TripExpensesProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isPaymentSharedDialogOpen, setIsPaymentSharedDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay'>('wallet')
  const [userWalletBalance, setUserWalletBalance] = useState<number>(0)
  const [tripStartDate, setTripStartDate] = useState<Date | null>(null)
  const [showSplitDetails, setShowSplitDetails] = useState<boolean>(false)

  // Fetch trip details to get start date
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}`)
        const data = await response.json()

        if (response.ok && data.trip) {
          setTripStartDate(new Date(data.trip.startDate))
        }
      } catch (error) {
        console.error('Error fetching trip details:', error)
      }
    }

    fetchTripDetails()
    // Also fetch wallet balance at initialization
    fetchWalletBalance()
  }, [tripId])

  // Check if payment deadline has passed (2 days before trip)
  const isPaymentDeadlinePassed = () => {
    if (!tripStartDate) return false

    const deadlineDate = new Date(tripStartDate)
    deadlineDate.setDate(deadlineDate.getDate() - 2)

    return new Date() > deadlineDate
  }

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
    },
  })

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/profile/wallet')
      const data = await response.json()

      if (response.ok) {
        setUserWalletBalance(data.wallet.balance)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  // Open payment dialog with the expense details
  const openPaymentDialog = (expense: Expense) => {
    setSelectedExpense(expense)

    const userShare = expense.shares.find((share) => share.user?._id === session?.user.id)
    if (userShare) {
      // Set default payment to the remaining amount
      setPaymentAmount(userShare.amount - userShare.amountPaid)
    }

    // Get fresh wallet balance when opening payment dialog
    fetchWalletBalance()
    setIsPaymentDialogOpen(true)
  }

  const handleAddExpense = async (data: ExpenseFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add expense")
      }

      toast({
        title: "Expense added",
        description: "The expense has been added successfully",
      })

      form.reset()
      setIsDialogOpen(false)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Failed to add expense",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayExpense = async () => {
    if (!selectedExpense) return

    setIsProcessingPayment(true)

    try {
      // Find user's share
      const userShare = selectedExpense.shares.find((share) => share.user?._id === session?.user.id)

      if (!userShare) {
        throw new Error("You don't have a share in this expense")
      }

      const remainingAmount = userShare.amount - userShare.amountPaid

      if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
        throw new Error(`Amount must be between 1 and ${formatCurrency(remainingAmount)}`)
      }

      if (paymentMethod === 'wallet') {
        // Check if wallet has enough balance
        if (userWalletBalance < paymentAmount) {
          throw new Error('Insufficient wallet balance')
        }

        // Process payment with wallet
        const response = await fetch(`/api/trips/${tripId}/expenses/${selectedExpense._id}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: paymentAmount,
            paymentMethod: 'wallet'
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to process payment")
        }

        toast({
          title: "Payment successful",
          description: `Successfully paid ${formatCurrency(paymentAmount)} from your wallet`,
        })

        setIsPaymentDialogOpen(false)
        // Update wallet balance after payment
        fetchWalletBalance()
        onUpdate()
      } else {
        // Process payment with Razorpay
        const response = await fetch(`/api/trips/${tripId}/expenses/${selectedExpense._id}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: paymentAmount,
            paymentMethod: 'razorpay'
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to initiate payment")
        }

        // Initialize Razorpay
        initializeRazorpay({
          orderId: result.orderId,
          amount: result.amount,
          transactionId: result.transactionId
        })
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const initializeRazorpay = (data: { orderId: string; amount: number; transactionId: string }) => {
    if (typeof window === "undefined") return

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => createRazorpayInstance(data)
      document.body.appendChild(script)
    } else {
      createRazorpayInstance(data)
    }
  }

  const createRazorpayInstance = (data: { orderId: string; amount: number; transactionId: string }) => {
    const options = {
      key: "rzp_test_hylrDzoeoSNVKm", // Replace with your Razorpay key from env
      amount: data.amount * 100, // Amount in paisa
      currency: "INR",
      name: "Trip App",
      description: `Payment for "${selectedExpense?.title}"`,
      order_id: data.orderId,
      handler: function (response: any) {
        verifyPayment(response, data.transactionId)
      },
      prefill: {
        name: session?.user?.name || "",
        email: session?.user?.email || "",
      },
      theme: {
        color: "#3B82F6",
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
    setIsPaymentDialogOpen(false)
  }

  const verifyPayment = async (
    response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string },
    transactionId: string
  ) => {
    try {
      const verifyResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...response,
          transaction_id: transactionId,
        }),
      })

      const data = await verifyResponse.json()

      if (verifyResponse.ok) {
        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully",
        })
        onUpdate()
      } else {
        throw new Error(data.error || "Payment verification failed")
      }
    } catch (error: any) {
      console.error("Verification error:", error)
      toast({
        title: "Error",
        description: error.message || "Payment verification failed",
        variant: "destructive",
      })
    }
  }

  const calculateTotalPaid = (expense: Expense) => {
    return expense.shares.reduce((total, share) => total + share.amountPaid, 0)
  }

  const calculatePaymentProgress = (expense: Expense) => {
    const totalPaid = calculateTotalPaid(expense)
    return (totalPaid / expense.amount) * 100
  }

  const showPaymentSharesDialog = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsPaymentSharedDialogOpen(true)
  }

  const getTotalUserShare = () => {
    return expenses.reduce((total, expense) => {
      const userShare = expense.shares.find((share) => share.user?._id === session?.user.id)
      return total + (userShare?.amount || 0)
    }, 0)
  }

  const getTotalRemainingAmount = () => {
    return expenses.reduce((total, expense) => {
      const userShare = expense.shares.find((share) => share.user?._id === session?.user.id)
      if (userShare) {
        return total + (userShare.amount - userShare.amountPaid)
      }
      return total
    }, 0)
  }

  const acceptedMembers = members.filter((member) => member.status === "accepted")

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            onClick={() => setShowSplitDetails(!showSplitDetails)}
          >
            <Divide className="w-4 h-4 mr-2" />
            {showSplitDetails ? "Hide Split Details" : "Show Split Details"}
          </Button> */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Enter the details of the expense to split among trip members.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddExpense)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Dinner at Restaurant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional details about the expense" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Expense"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isPaymentDeadlinePassed() && (
        <div className="p-4 mb-6 text-amber-800 bg-amber-50 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Payment deadline has passed</p>
            <p className="text-sm">All payments needed to be completed 2 days before the trip starts. You can still view the expense breakdown.</p>
          </div>
        </div>
      )}

      {/* Summary Card - Enhanced to show split details and payment options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Split Summary</CardTitle>
          <CardDescription>Overview of your expense share and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Total Trip Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(expenses.reduce((total, expense) => total + expense.amount, 0))}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Your Total Share</p>
              <p className="text-2xl font-bold">
                {formatCurrency(getTotalUserShare())}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Already Paid</p>
              <p className="text-2xl font-bold">
                {formatCurrency(getTotalUserShare() - getTotalRemainingAmount())}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Remaining Balance</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(getTotalRemainingAmount())}
                </p>
                {!isPaymentDeadlinePassed() && getTotalRemainingAmount() > 0 && (
                  <div className="ml-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // Find the first expense with remaining balance
                        const expenseWithRemainingBalance = expenses.find(expense => {
                          const userShare = expense.shares.find((share) => share.user?._id === session?.user.id);
                          return userShare && userShare.amount > userShare.amountPaid;
                        });

                        if (expenseWithRemainingBalance) {
                          openPaymentDialog(expenseWithRemainingBalance);
                        }
                      }}
                    >
                      Pay Now
                    </Button>
                  </div>
                )}
              </div>
              {userWalletBalance > 0 && (
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <Wallet className="w-3.5 h-3.5 mr-1" />
                  <span>Wallet Balance: {formatCurrency(userWalletBalance)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Receipt className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold">No expenses yet</h3>
            <p className="mb-4 text-gray-600">
              Add your first expense to start tracking and splitting costs with your trip members.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Expense List */}
          <div className="space-y-4">
            {expenses.map((expense) => {
              // Find the current user's share
              const userShare = expense.shares.find((share) => share.user?._id === session?.user.id)
              const paymentProgress = calculatePaymentProgress(expense)
              const isPaid = userShare?.status === "completed"
              const isPartiallyPaid = userShare?.status === "partial"
              const remainingAmount = userShare ? userShare.amount - userShare.amountPaid : 0

              return (
                <Card key={expense._id} className="overflow-hidden">
                  <div className="h-2">
                    <Progress value={paymentProgress} className="h-2 rounded-none" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium">{expense.title}</h3>
                          <Badge variant="outline" className="capitalize">
                            {formatDate(expense.date)}
                          </Badge>
                        </div>
                        {expense.description && <p className="mt-1 text-sm text-gray-600">{expense.description}</p>}

                        <div className="flex items-center mt-3 text-sm text-gray-600">
                          <Avatar className="w-5 h-5 mr-2">
                            <AvatarImage src={expense.addedBy.profileImage} alt={expense.addedBy.name} />
                            <AvatarFallback>{expense.addedBy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>Added by {expense.addedBy.name}</span>
                        </div>

                        {/* Participants summary */}
                        <div className="mt-3 mb-1">
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Participants ({expense.shares.length})</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-6 text-xs"
                              onClick={() => showPaymentSharesDialog(expense)}
                            >
                              View Details
                            </Button>
                          </div>
                          <div className="flex -space-x-2 overflow-hidden">
                            {expense.shares
                              .filter(share => share.user && share.user._id) // Only include shares with valid user data
                              .map((share) => (
                                <Avatar key={share.user?._id || 'unknown'} className="inline-block border-2 border-white w-8 h-8">
                                  <AvatarImage src={share.user?.profileImage} alt={share.user?.name || 'User'} />
                                  <AvatarFallback>{share.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                              ))}
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-medium text-gray-800 border-2 border-white">
                              {formatCurrency(expense.amount / expense.shares.length)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center mt-3">
                          <div className="text-sm text-gray-500">
                            Payment status: {paymentProgress.toFixed(0)}% complete
                          </div>
                        </div>

                        {/* Split details section */}
                        {userShare && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center mb-2">
                              <Avatar className="w-6 h-6 mr-2">
                                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || ""} />
                                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium text-sm">Your Split Details:</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div className="flex justify-between">
                                <span>Total Amount:</span>
                                <span className="font-medium">{formatCurrency(expense.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Per Person:</span>
                                <span className="font-medium">{formatCurrency(expense.amount / expense.shares.length)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Your Share:</span>
                                <span className="font-medium">{formatCurrency(userShare.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Already Paid:</span>
                                <span className="font-medium">{formatCurrency(userShare.amountPaid)}</span>
                              </div>
                              <div className="col-span-2 flex justify-between pt-1 border-t">
                                <span className="font-medium">Remaining:</span>
                                <span className="font-medium">{formatCurrency(remainingAmount)}</span>
                              </div>
                            </div>

                            {!isPaid && !isPaymentDeadlinePassed() && (
                              <div className="mt-2 flex justify-center">
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => openPaymentDialog(expense)}
                                >
                                  <Wallet className="w-4 h-4 mr-2" />
                                  Pay Your Split Amount ({formatCurrency(remainingAmount)})
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-xl font-semibold">{formatCurrency(expense.amount)}</div>

                        {userShare && (
                          <div className="mt-1 text-sm">
                            <div className="flex items-center gap-1">
                              <span>Your share: {formatCurrency(userShare.amount)}</span>
                              {isPaid ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">
                                  <Check className="w-3 h-3 mr-1" />
                                  Paid
                                </Badge>
                              ) : isPartiallyPaid ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 ml-2">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Partial ({formatCurrency(userShare.amountPaid)})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 ml-2">
                                  Unpaid
                                </Badge>
                              )}
                            </div>

                            {!isPaid && !isPaymentDeadlinePassed() && remainingAmount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => openPaymentDialog(expense)}
                              >
                                <Wallet className="w-3 h-3 mr-1" />
                                Pay Split Amount
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Payment Dialog - Updated to focus on wallet payment */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Your Split Amount</DialogTitle>
            <DialogDescription>
              {selectedExpense && <>Pay your share for "{selectedExpense.title}"</>}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Add user profile at the top of payment dialog */}
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name || ""} />
                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-sm font-medium">Your Wallet Balance</Label>
              <div className="p-3 rounded-md bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-medium">{formatCurrency(userWalletBalance)}</span>
                </div>
                {userWalletBalance === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPaymentDialogOpen(false);
                      router.push('/wallet');
                    }}
                  >
                    Add Money
                  </Button>
                )}
              </div>
            </div>

            {/* Rest of the dialog content remains the same */}

            <Label className="text-sm font-medium">Payment Amount</Label>
            <div className="flex items-center mt-2">
              <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
              <Input
                type="number"
                min="1"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number.parseFloat(e.target.value))}
              />
            </div>
            {selectedExpense && (
              <div className="mt-3 grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Share:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      selectedExpense.shares.find((share) => share.user._id === session?.user.id)?.amount || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      selectedExpense.shares.find((share) => share.user._id === session?.user.id)?.amountPaid || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (selectedExpense.shares.find((share) => share.user._id === session?.user.id)?.amount || 0) -
                      (selectedExpense.shares.find((share) => share.user._id === session?.user.id)?.amountPaid || 0)
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="font-medium text-gray-700 mb-1 flex items-center">
                <Wallet className="w-4 h-4 mr-1.5" />
                Pay with Wallet
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Use your wallet balance to pay your split amount. Quick and easy!
              </p>
              {userWalletBalance < paymentAmount && (
                <div className="p-2 mt-2 text-red-600 bg-red-50 rounded flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span className="text-sm">Insufficient balance. Please add money to your wallet.</span>
                </div>
              )}

              <Button
                className="mt-3 w-full"
                onClick={handlePayExpense}
                disabled={isProcessingPayment || userWalletBalance < paymentAmount}
              >
                {isProcessingPayment ? "Processing..." : "Pay Now with Wallet"}
              </Button>
            </div>

            <div className="mt-4">
              <p className="font-medium text-gray-700 mb-1 flex items-center">
                <CreditCard className="w-4 h-4 mr-1.5" />
                Pay Online
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Pay securely using credit/debit card, UPI, or other online methods.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPaymentMethod('razorpay');
                  handlePayExpense();
                }}
                disabled={isProcessingPayment}
              >
                Pay with Razorpay
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Status Dialog */}
      <Dialog open={isPaymentSharedDialogOpen} onOpenChange={setIsPaymentSharedDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Expense Payment Status</DialogTitle>
            <DialogDescription>
              {selectedExpense && <>Payment breakdown for "{selectedExpense.title}"</>}
            </DialogDescription>
          </DialogHeader>

          {selectedExpense && (
            <div className="py-4">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Total Amount</p>
                  <p className="font-bold">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <p>Per Member (Equal Split)</p>
                  <p>{formatCurrency(selectedExpense.amount / selectedExpense.shares.length)}</p>
                </div>

                <div className="mt-4">
                  <p className="font-medium mb-2">Payment Progress</p>
                  <Progress value={calculatePaymentProgress(selectedExpense)} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1 text-right">
                    {calculateTotalPaid(selectedExpense).toFixed(2)} of {selectedExpense.amount.toFixed(2)} paid
                    ({calculatePaymentProgress(selectedExpense).toFixed(0)}%)
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Member Payments</p>
                  <p className="text-sm text-gray-600">{selectedExpense?.shares.length} Members</p>
                </div>
                <div className="space-y-3">
                  {selectedExpense?.shares
                    .filter(share => share.user && share.user._id) // Only include shares with valid user data
                    .map((share, index) => {
                      const isPaid = share.status === "completed"
                      const isPartiallyPaid = share.status === "partial"
                      const memberProgress = (share.amountPaid / share.amount) * 100
                      const isCurrentUser = share.user?._id === session?.user.id

                      return (
                        <div key={share.user?._id || `share-${index}`} className={`p-3 border rounded-lg ${isCurrentUser ? 'border-primary bg-primary/5' : ''}`}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={share.user?.profileImage} alt={share.user?.name || 'User'} />
                              <AvatarFallback>{share.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{share.user?.name || 'Unknown user'}</div>
                              <div className="text-xs text-gray-500">{share.user?.email || 'No email'}</div>
                            </div>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="ml-1 text-xs">You</Badge>
                            )}

                            {isPaid ? (
                              <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                                <Check className="w-3 h-3 mr-1" />
                                Paid
                              </Badge>
                            ) : isPartiallyPaid ? (
                              <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700 border-amber-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Partial
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="ml-auto bg-red-50 text-red-700 border-red-200">
                                Unpaid
                              </Badge>
                            )}
                          </div>

                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{memberProgress.toFixed(0)}%</span>
                            </div>
                            <Progress value={memberProgress} className="h-1.5" />
                          </div>

                          <div className="grid grid-cols-3 gap-1 mt-2 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Amount</span>
                              <span className="font-medium">{formatCurrency(share.amount)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Paid</span>
                              <span className="font-medium">{formatCurrency(share.amountPaid)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Remaining</span>
                              <span className="font-medium">{formatCurrency(share.amount - share.amountPaid)}</span>
                            </div>
                          </div>

                          {isCurrentUser && !isPaid && !isPaymentDeadlinePassed() && (share.amount - share.amountPaid) > 0 && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setIsPaymentSharedDialogOpen(false);
                                  openPaymentDialog(selectedExpense);
                                }}
                              >
                                <Wallet className="w-3 h-3 mr-1.5" />
                                Pay Your Split Amount
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentSharedDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
