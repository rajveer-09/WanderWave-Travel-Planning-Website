// import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export function formatCurrency(amount: number): string {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//   }).format(amount);
// }

// export function formatDate(date: Date | string): string {
//   return new Date(date).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// }

// export function calculateDaysLeft(
//   startDate: Date | string,
//   endDate: Date | string
// ): number {
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   // Reset time part for accurate day calculation
//   start.setHours(0, 0, 0, 0);
//   end.setHours(0, 0, 0, 0);

//   const diffTime = end.getTime() - start.getTime();
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//   return diffDays;
// }

// export function calculateTripDuration(
//   startDate: Date | string,
//   endDate: Date | string
// ): number {
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   // Reset time part for accurate day calculation
//   start.setHours(0, 0, 0, 0);
//   end.setHours(0, 0, 0, 0);

//   const diffTime = end.getTime() - start.getTime();
//   // Add 1 to include both start and end days in the duration
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//   return diffDays;
// }

// export function calculateEqualShares(
//   amount: number,
//   memberCount: number
// ): number {
//   return Math.ceil((amount / memberCount) * 100) / 100; // Round up to 2 decimal places
// }
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function calculateDaysLeft(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time part for accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function calculateTripDuration(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time part for accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  // Add 1 to include both start and end days in the duration
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}

export function calculateEqualShares(
  amount: number,
  memberCount: number
): number {
  return Math.ceil((amount / memberCount) * 100) / 100; // Round up to 2 decimal places
}

// Add this new function for formatting relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than an hour
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Less than a day
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Less than a week
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? "yesterday" : `${diffInDays}d ago`;
  }

  // Format as date
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  // Add year if not the current year
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return date.toLocaleDateString(undefined, options);
}
