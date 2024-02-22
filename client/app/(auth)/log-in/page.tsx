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
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const token = data.token;
        const decodedToken = parseJwt(token);
        localStorage.setItem("token", token);
        if (decodedToken.role === "Company") router.push("/CompanyPanel");
        else router.push("/StudentInterface");
        setIsLoggedIn(true);
        handleStorageChange(setIsLoggedIn);
      } else {
        router.push("/log-in");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <main className="flex flex-col lg:flex-row gap-10 p-6 items-center justify-center h-screen">
      <aside className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Log In </h2>
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
            <div className="space-y-2">
              <Label htmlFor="password">Role</Label>
              <Input
                id="role"
                required
                type="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              Log In
            </Button>
          </CardContent>
        </Card>{" "}
      </aside>
    </main>
  );
};

export default Page;
