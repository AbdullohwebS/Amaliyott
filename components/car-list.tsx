"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import type { Car } from "@/types/car"
import EditCarModal from "./edit-car-modal"
import { useCars } from "@/hooks/use-cars"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CarListProps {
  cars: Car[]
  onCarDeleted: () => void
}

export default function CarList({ cars, onCarDeleted }: CarListProps) {
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { deleteCar } = useCars({ page: 1, limit: 5 })
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      // Try API first, then fallback to local storage
      let success = false

      try {
        const response = await fetch(`https://json-api.uz/api/project/fn37/cars/${id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          success = true
          toast({
            title: "Success",
            description: "Car deleted successfully via API",
          })
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (apiError) {
        console.warn("API delete failed, using local storage:", apiError)

        // Fallback to local storage
        const deleted = deleteCar(id)
        if (deleted) {
          success = true
          toast({
            title: "Success",
            description: "Car deleted successfully (from local storage)",
          })
        }
      }

      if (success) {
        onCarDeleted()
      } else {
        throw new Error("Failed to delete car")
      }
    } catch (error) {
      console.error("Error deleting car:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete car. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (car: Car) => {
    setEditingCar(car)
    setIsEditModalOpen(true)
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-700">No cars found</h2>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  {car.brand} {car.model}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Year:</span> {car.year}
                  </div>
                  <div>
                    <span className="font-medium">Color:</span> {car.color}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ${car.price?.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {car.id}
                  </div>
                </div>
                {car.description && <p className="text-gray-600 text-sm line-clamp-2">{car.description}</p>}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/car/${car.id}`} className="flex items-center gap-1">
                    <Eye size={16} />
                    View
                  </Link>
                </Button>

                <Button variant="outline" size="sm" onClick={() => handleEdit(car)} className="flex items-center gap-1">
                  <Edit size={16} />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex items-center gap-1">
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the car "{car.brand} {car.model}"
                        from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(car.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {editingCar && (
        <EditCarModal
          car={editingCar}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onCarUpdated={onCarDeleted}
        />
      )}
    </div>
  )
}
