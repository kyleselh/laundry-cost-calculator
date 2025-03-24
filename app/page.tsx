"use client"

import { useState } from "react"
import { Calculator, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Machine {
  name: string
  capacity: number
  cost: number
}

interface CalculationResult {
  machines: {
    machine: Machine
    quantity: number
  }[]
  totalCost: number
}

export default function LaundryCalculator() {
  const [inputValue, setInputValue] = useState<string>("")
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [activeTab, setActiveTab] = useState<string>("loads")

  const machines: Machine[] = [
    { name: "Standard Washer", capacity: 1, cost: 2.5 },
    { name: "Large Washer", capacity: 2, cost: 4.0 },
    { name: "Extra Large Washer", capacity: 4, cost: 6.5 },
  ]

  const handleCalculate = () => {
    const value = Number.parseFloat(inputValue)

    if (isNaN(value) || value <= 0) {
      return
    }

    // Convert pounds to loads if needed (assuming 1 load = 8 pounds)
    const totalLoads = activeTab === "pounds" ? value / 8 : value

    // Calculate the optimal machine distribution
    const result = calculateOptimalMachines(totalLoads, machines)
    setCalculationResult(result)
  }

  const calculateOptimalMachines = (totalLoads: number, availableMachines: Machine[]): CalculationResult => {
    // Sort machines by capacity (largest first) for greedy algorithm
    const sortedMachines = [...availableMachines].sort((a, b) => b.capacity - a.capacity)

    let remainingLoads = totalLoads
    const machineUsage: { machine: Machine; quantity: number }[] = []
    let totalCost = 0

    // Greedy algorithm to allocate machines
    sortedMachines.forEach((machine) => {
      if (remainingLoads > 0) {
        const quantity = Math.floor(remainingLoads / machine.capacity)
        if (quantity > 0) {
          machineUsage.push({ machine, quantity })
          remainingLoads -= quantity * machine.capacity
          totalCost += quantity * machine.cost
        }
      }
    })

    // Handle any remaining loads with the smallest machine
    if (remainingLoads > 0) {
      const smallestMachine = sortedMachines[sortedMachines.length - 1]
      machineUsage.push({ machine: smallestMachine, quantity: 1 })
      totalCost += smallestMachine.cost
    }

    return {
      machines: machineUsage,
      totalCost,
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-medium text-gray-900">Laundry Cost Calculator</CardTitle>
          <CardDescription>Calculate the cost of your laundry loads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="loads" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="loads">Loads</TabsTrigger>
              <TabsTrigger value="pounds">Pounds</TabsTrigger>
            </TabsList>
            <TabsContent value="loads" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="loads-input">Number of Loads</Label>
                <Input
                  id="loads-input"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Enter number of loads"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="pounds" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="pounds-input">Weight in Pounds</Label>
                <Input
                  id="pounds-input"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Enter weight in pounds"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCalculate}>
            <Calculator className="mr-2 h-4 w-4" /> Calculate
          </Button>

          {calculationResult && (
            <div className="mt-6 space-y-4 pt-4">
              <h3 className="font-medium text-lg">Recommended Machines</h3>
              <div className="space-y-3">
                {calculationResult.machines.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <p className="font-medium">{item.machine.name}</p>
                      <p className="text-sm text-gray-500">
                        Capacity: {item.machine.capacity} {activeTab === "loads" ? "load" : "pounds"}
                      </p>
                      <p className="text-sm text-gray-500">Cost: ${item.machine.cost.toFixed(2)}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      x{item.quantity}
                    </Badge>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <p className="font-medium text-lg">Total Cost</p>
                <p className="text-xl font-bold text-green-700 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {calculationResult.totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

