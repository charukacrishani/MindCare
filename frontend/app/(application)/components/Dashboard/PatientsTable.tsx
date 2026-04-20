"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

interface Patient {
  id: string;
  name: string;
  description: string;
  age: number;
}

export function PatientsTable() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await apiClient.get<Patient[]>("/dashboard/doctor/patients");
      setPatients(response.data);
    } catch (error) {
      setPatients([]);
      console.error("Error fetching patients:", error);
    }
  }

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Patients</h1>
        <div className="relative w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 text-sm rounded-xl shadow-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              {["Name", "Description", "Age", "Time", "Actions"].map((col) => (
                <TableHead
                  key={col}
                  className="text-xs font-medium text-gray-400 uppercase tracking-wide py-4"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((patient) => (
              <TableRow
                key={patient.id}
                onClick={() => router.push(`/patient/${patient.id}`)}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
              >
                <TableCell className="py-4 font-medium text-gray-800 text-sm">
                  {patient.name}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {patient.description}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {patient.age}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs px-4 h-8 font-medium border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    view history <History size={12} className="ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
