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
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
      setForm({ ...form, cardNumber: digitsOnly });
      return;
    }

    if (name === "cvv") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      setForm({ ...form, cvv: digitsOnly });
      return;
    }

    if (name === "expiry") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      const formattedValue =
        digitsOnly.length > 2
          ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
          : digitsOnly;
      setForm({ ...form, expiry: formattedValue });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const isNameValid = form.name.trim().length > 0;
  const isCardNumberValid = /^\d{16}$/.test(form.cardNumber);
  const isExpiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry);
  const isCvvValid = /^\d{3,4}$/.test(form.cvv);
  const isAmountValid = form.amount.trim().length > 0;

  const isFormValid =
    isNameValid &&
    isCardNumberValid &&
    isExpiryValid &&
    isCvvValid &&
    isAmountValid;

  const handlePayNow = () => {
    if (!isFormValid) {
      return;
    }

    handleBookAppointment();
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
                placeholder="Enter card holder name"
              />
            </div>

            <div className="space-y-1">
              <Label>Card Number</Label>
              <Input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234123412341234"
                inputMode="numeric"
                maxLength={16}
              />
            </div>

            <div className="flex gap-3">
              <div className="space-y-1 w-1/2">
                <Label>Expiry</Label>
                <Input
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength={5}
                />
              </div>

              <div className="space-y-1 w-1/2">
                <Label>CVV</Label>
                <Input
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  inputMode="numeric"
                  maxLength={4}
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

            <Button className="w-full mt-2" onClick={handlePayNow} disabled={!isFormValid}>
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
