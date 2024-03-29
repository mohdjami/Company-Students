"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/lib/AuthContext";
import { handleStorageChange } from "@/lib/Storage";
import { parseJwt } from "@/lib/parsejwt";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";

const Page = () => {
  const router = useRouter();
  const { setIsLoggedIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    console.log(process.env.NEXT_PUBLIC_NEXT_APP_URL);
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_NEXT_APP_URL}/api/auth/student/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role: "Student",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const token = data.token;
      localStorage.setItem("token", token);
      router.push("/verify-otp");

      setIsLoggedIn(true);
      handleStorageChange(setIsLoggedIn);
    } else {
      router.push("/log-in");
    }
  };
  return (
    <main className="flex flex-col lg:flex-row gap-10 p-6 items-center justify-center h-screen">
      <aside className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Register as A Student </h2>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>{" "}
            <Button className="w-full" onClick={handleSubmit}>
              Register
            </Button>
          </CardContent>
        </Card>{" "}
      </aside>
    </main>
  );
};

export default Page;
