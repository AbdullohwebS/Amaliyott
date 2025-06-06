"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"
import AddCarModal from "@/components/add-car-modal"
import CarList from "@/components/car-list"
import Pagination from "@/components/pagination"
import ApiStatus from "@/components/api-status"
import { useCars } from "@/hooks/use-cars"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { cars, loading, totalPages, totalCars, fetchCars, addCar, usingLocalStorage } = useCars({
    page: currentPage,
    limit: 5,
    brand: selectedBrand,
    search: searchTerm,
  })

  const { toast } = useToast()

  // Get unique brands for filter
  const [allBrands, setAllBrands] = useState<string[]>([])

  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        const storedCars = localStorage.getItem("car-management-cars")
        if (storedCars) {
          const parsedCars = JSON.parse(storedCars)
          const brands = [...new Set(parsedCars.map((car: any) => car.brand))].filter(Boolean)
          setAllBrands(brands)
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
      }
    }
    fetchAllBrands()
  }, [refreshKey])

  const handleAddCar = async (carData: any) => {
    try {
      // Try API first, then fallback to local storage
      let success = false

      try {
        const response = await fetch("https://json-api.uz/api/project/fn37/cars", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(carData),
        })

        if (response.ok) {
          success = true
          toast({
            title: "Success",
            description: "Car added successfully via API",
          })
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (apiError) {
        console.warn("API add failed, using local storage:", apiError)

        // Fallback to local storage
        const newCar = addCar(carData)
        if (newCar) {
          success = true
          toast({
            title: "Success",
            description: "Car added successfully (stored locally)",
          })
        }
      }

      if (success) {
        setRefreshKey((prev) => prev + 1)
        fetchCars()
      } else {
        throw new Error("Failed to add car")
      }
    } catch (error) {
      console.error("Error adding car:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add car. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    fetchCars()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Car Management System</h1>
          <p className="text-gray-600 mt-1">{loading ? "Loading..." : `${totalCars} cars found`}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add New Car
        </Button>
      </div>

      <ApiStatus usingLocalStorage={usingLocalStorage} />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by brand or model..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedBrand} onValueChange={handleBrandChange}>
              <SelectTrigger className="w-[180px]">
                <Filter size={18} className="mr-2" />
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {allBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <CarList cars={cars} onCarDeleted={handleRefresh} />

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}

      <AddCarModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddCar={handleAddCar} />

      <Toaster />
    </main>
  )
}
