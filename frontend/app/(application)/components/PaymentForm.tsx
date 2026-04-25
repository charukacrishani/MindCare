"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CardPaymentMockup( {handleBookAppointment, isOpen, onClose, amount}: {handleBookAppointment: () => void; isOpen: boolean; onClose: () => void; amount: string} ) {
  const [form, setForm] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    amount: amount,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label>Card Holder Name</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <Label>Card Number</Label>
              <Input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3">
              <div className="space-y-1 w-1/2">
                <Label>Expiry</Label>
                <Input
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1 w-1/2">
                <Label>CVV</Label>
                <Input
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Amount</Label>
              <Input
                name="amount"
                type="text"
                value={form.amount}
                onChange={handleChange}
                disabled
              />
            </div>

            <Button className="w-full mt-2" onClick={handleBookAppointment}>
              Pay Now
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              UI mockup only — no real transaction
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
