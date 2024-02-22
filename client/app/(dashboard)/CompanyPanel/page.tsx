"use client";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CreateStudent from "@/components/CreateJobForm";
import { useContext, useState } from "react";
import TokenContext from "@/lib/TokenContext";
import { parseJwt } from "@/lib/parsejwt";
import CreateJob from "@/components/CreateJobForm";

export default function AdminPanel() {
  const [activeComponent, setActiveComponent] = useState("");
  const rawToken = useContext(TokenContext);
  const token = rawToken ? parseJwt(rawToken) : null;
  if (token === null || token.role !== "Company") {
    return (
      <main className="flex flex-col lg:flex-row gap-10 p-6 mt-20 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          Either you are not an admin or reload the page
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-10 p-6 mt-20 items-center justify-center">
      <div className="flex flex-row items-center space-x-4">
        <Button onClick={() => setActiveComponent("CreateJob")}>
          Create Job
        </Button>
        {/* <Button onClick={() => setActiveComponent("ViewTransactions")}>
          View Transactions
        </Button> */}
        <Button onClick={() => setActiveComponent("ViewJobs")}>
          Jobs Created
        </Button>
      </div>
      <div className={activeComponent === "CreateJob" ? "" : "hidden"}>
        <CreateJob />
      </div>
      {/* <div className={activeComponent === "ViewTransactions" ? "" : "hidden"}>
        <AssignTasksForm />
      </div> */}
      <div className={activeComponent === "Students" ? "" : "hidden"}>
        Student Cards
      </div>
    </main>
  );
}
