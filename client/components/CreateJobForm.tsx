"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { resolve } from "path";
import TokenContext from "@/lib/TokenContext";
import { parseJwt } from "@/lib/parsejwt";

const CreateJob = () => {
  const { toast } = useToast();
  const router = useRouter();
  const rawToken = useContext(TokenContext);
  const token = rawToken ? parseJwt(rawToken) : null;

  const [name, setName] = useState("");
  const [minCTC, setminCTC] = useState("");
  const [maxCTC, setmaxCTC] = useState("");
  const [location, setLocation] = useState("");
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_NEXT_APP_URL}/api/jobs/postJob`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            minCTC,
            maxCTC,
            location,
            companyId: token.id,
          }),
        }
      );
      setName("");
      setLocation("");
      setmaxCTC("");
      setminCTC("");
      if (response.status === 201) {
        toast({
          title: "User Successfully created",
          variant: "default",
        });
        router.push("/AdminPanel");
      } else if (response.status === 403) {
        toast({
          title: "You are not authorized for this action.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "User not created",
        variant: "destructive",
      });
      router.push("/create-student");
    }
  };
  return (
    <main className="flex flex-col lg:flex-row gap-10 p-6 cols-3 items-start">
      <div className="flex flex-col gap-6 w-full">
        <aside className="flex flex-col gap-6">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <h2 className="text-2xl font-bold">Create Job</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {" "}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  type="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>{" "}
              <div className="space-y-2">
                <Label htmlFor="email">minCTC</Label>
                <Input
                  id="minCTC"
                  required
                  type="minCTC"
                  value={minCTC}
                  onChange={(e) => setminCTC(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">MaxCTC</Label>
                <Input
                  id="maxCTC"
                  required
                  type="maxCTC"
                  value={maxCTC}
                  onChange={(e) => setmaxCTC(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Location</Label>
                <Input
                  id="location"
                  required
                  type="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit}>
                Create the Job
              </Button>
            </CardContent>
          </Card>{" "}
        </aside>
      </div>
    </main>
  );
};

export default CreateJob;
