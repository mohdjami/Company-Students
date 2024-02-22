"use client";
import { useState, useEffect, useContext } from "react";
import TokenContext from "@/lib/TokenContext";
import { fetchTransactions } from "@/api/fetchTransactions";
import SkeletonLoader from "./SkeletonLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "lucide-react";

export const StudentInterface = () => {
  const [loading, isLoading] = useState(true);
  const [transaction, setTransaction] = useState("");
  const [see, onSee] = useState(false);

  const rawToken = useContext(TokenContext);

  useEffect(() => {
    const fetchTasks = async () => {
      if (rawToken) {
        isLoading(true);
        const transactions = await fetchTransactions(rawToken);
        if (transactions) {
          setTransaction(transactions);
          isLoading(false);
        }
      }
    };

    fetchTasks();
  }, [rawToken]);
  if (loading) {
    return <SkeletonLoader />;
  }
  return (
    <main className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        Student interface
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Description
              </p>
            </CardDescription>
            <p className="mt-2 text-sm text-gray-500">Status</p>

            <div>
              <Badge className="font-medium">Date</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
