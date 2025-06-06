"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import { useCars } from "@/hooks/use-cars"
import type { Car } from "@/types/car"
import ImageSlider from "@/components/image-slider"
import EditCarModal from "@/components/edit-car-modal"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { getCar } = useCars({ page: 1, limit: 5 })

  useEffect(() => {
    const loadCar = async () => {
      setLoading(true)
      try {
        const foundCar = getCar(params.id as string)
        setCar(foundCar)
      } catch (error) {
        console.error("Error loading car details:", error)
        setCar(null)
      }
      setLoading(false)
    }

    if (params.id) {
      loadCar()
    }
  }, [params.id, getCar])

  const handleCarUpdated = () => {
    // Reload car data
    const updatedCar = getCar(params.id as string)
    setCar(updatedCar)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-32 mt-2 md:mt-0" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-700">Car not found</h2>
          <p className="text-gray-500 mt-2">The car you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go back to car list
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold">
            {car.brand} {car.model}
          </h1>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <div className="text-2xl font-bold text-green-600">${car.price?.toLocaleString()}</div>
            <Button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2">
              <Edit size={16} />
              Edit Car
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ImageSlider images={car.thumbnails || []} />
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Brand:</span>
                  <span className="font-semibold">{car.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Model:</span>
                  <span className="font-semibold">{car.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Year:</span>
                  <span className="font-semibold">{car.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Color:</span>
                  <span className="font-semibold">{car.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Price:</span>
                  <span className="font-semibold text-green-600">${car.price?.toLocaleString()}</span>
                </div>
                {car.vin && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">VIN:</span>
                    <span className="font-mono text-sm">{car.vin}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">ID:</span>
                  <span className="font-mono text-sm">{car.id}</span>
                </div>
              </div>

              {car.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{car.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {car && (
        <EditCarModal
          car={car}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onCarUpdated={handleCarUpdated}
        />
      )}
    </div>
  )
}
