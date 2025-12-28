"use client";

import { useLocation } from "@/contexts/location-context";
import { Button } from "./ui/button";
import { Plus, Loader2, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignedIn, useUser } from "@clerk/nextjs";

const Info = () => {
  const { location, refreshLocation, isLoading, error } = useLocation();
  const userId = useUser().user?.id;

  const [open, setOpen] = useState(false);
  const [newChatRoomName, setNewChatRoomName] = useState("");
  const [newChatRoomRadius, setNewChatRadius] = useState<
    "2km" | "5km" | "10km"
  >("2km");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const createChatRoom = useMutation(api.tasks.createChatRoom);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full mt-2 p-8 bg-background/50 flex flex-col items-center justify-center gap-4 border-y border-dashed border-foreground/40">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.397_0.06984_227.223)]" />
        <p className="text-sm text-muted-foreground">
          Fetching your location...
        </p>
      </div>
    );
  }

  // No location access or error
  if (!location) {
    const isPermissionDenied =
      error?.toLowerCase().includes("denied") ||
      error?.toLowerCase().includes("permission");

    return (
      <div className="w-full mt-2 p-8 bg-background/50 flex flex-col items-center justify-center gap-6 border-y border-dashed border-foreground/40">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-90"
        >
          {/* Map background */}
          <rect
            x="10"
            y="20"
            width="100"
            height="80"
            rx="8"
            fill="oklch(0.397 0.06984 227.223)"
            opacity="0.1"
          />

          {/* Map pin */}
          <path
            d="M60 35C51.716 35 45 41.716 45 50C45 61.25 60 80 60 80C60 80 75 61.25 75 50C75 41.716 68.284 35 60 35Z"
            fill="oklch(0.397 0.06984 227.223)"
          />
          <circle cx="60" cy="50" r="5" fill="white" />

          {/* Question mark or error indicator */}
          <circle
            cx="85"
            cy="40"
            r="12"
            fill={
              isPermissionDenied ? "oklch(0.55 0.2 25)" : "oklch(0.7 0.15 30)"
            }
            opacity="0.9"
          />
          <text
            x="85"
            y="46"
            fontSize="16"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
          >
            {isPermissionDenied ? "!" : "?"}
          </text>
        </svg>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">
            {isPermissionDenied
              ? "Location Permission Blocked"
              : "Location Access Required"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md text-balance">
            {isPermissionDenied ? (
              <>
                Location access was denied. This app needs your location to show
                nearby chat rooms.
              </>
            ) : (
              <>
                This app requires your location to show nearby chat rooms and
                connect you with people in your area.
              </>
            )}
          </p>
        </div>

        {isPermissionDenied && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How to enable location access:</AlertTitle>
            <AlertDescription className="text-xs space-y-2 mt-2">
              <div>
                <strong>Chrome/Edge:</strong> Click the lock icon (🔒) in the
                address bar → Site settings → Location → Allow
              </div>
              <div>
                <strong>Firefox:</strong> Click the lock icon → Clear
                permissions and custom settings → Reload page
              </div>
              <div>
                <strong>Safari:</strong> Safari menu → Settings → Websites →
                Location → Allow for this website
              </div>
              <div className="pt-2 border-t">
                After changing settings, click the button below to refresh.
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {isPermissionDenied ? (
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
          ) : (
            <Button onClick={refreshLocation} size="lg" className="gap-2">
              <MapPin className="w-4 h-4" />
              Grant Location Access
            </Button>
          )}
        </div>
      </div>
    );
  }

  const { lat, lng } = location;
  // console.log(getDistanceInKm(lat, lng, 43, lng));

  const formSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!userId) {
      setFormError("You must be logged in to create a chat room");
      return;
    }

    if (!newChatRoomName || !newChatRoomRadius) {
      setFormError("Please fill in all fields");
      return;
    }

    if (
      newChatRoomRadius !== "2km" &&
      newChatRoomRadius !== "5km" &&
      newChatRoomRadius !== "10km"
    ) {
      setFormError("Radius must be 2km, 5km, or 10km");
      return;
    }

    if (newChatRoomName.length < 3) {
      setFormError("Chat room name must be at least 3 characters long");
      return;
    }

    try {
      setFormLoading(true);

      const data = {
        name: newChatRoomName,
        radius: newChatRoomRadius,
        owner_clerk_id: userId,
        ownerLat: lat,
        ownerLng: lng,
      };

      const chatroomId = await createChatRoom(data);
      console.log("Chat room created:", chatroomId);

      // Reset form and close dialog
      setNewChatRoomName("");
      setNewChatRadius("2km");
      setFormError("");
      setOpen(false);

      // Optional: Show success message or redirect
      // toast.success("Chat room created successfully!");
    } catch (error) {
      console.error("Error creating chat room:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="w-full mt-2 p-4 bg-background/50 flex flex-col-reverse gap-2 sm:flex-row sm:items-center border-y border-dashed border-foreground/40">
      <div>
        <SignedIn>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Chat Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat Room</DialogTitle>
                <DialogDescription className="text-balance">
                  The location restriction is based on the owner&apos;s location
                  and the selected radius.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={formSubmitHandler} className="space-y-3">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="chat-room-name">Chat Room Name</label>
                  <Input
                    id="chat-room-name"
                    name="chat-room-name"
                    placeholder="Your Chat Room Name"
                    value={newChatRoomName}
                    onChange={(e) => setNewChatRoomName(e.currentTarget.value)}
                    disabled={formLoading}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="chat-room-radius">Radius</label>
                  <Select
                    value={newChatRoomRadius}
                    onValueChange={(v) =>
                      setNewChatRadius(v as "2km" | "5km" | "10km")
                    }
                    disabled={formLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Radius</SelectLabel>
                        <SelectItem value="2km">2KM</SelectItem>
                        <SelectItem value="5km">5KM</SelectItem>
                        <SelectItem value="10km">10KM</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Chat Room"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </SignedIn>
      </div>
      <div className="flex items-center sm:justify-end gap-2 w-full">
        <span className="px-4 py-2 border rounded-full bg-chart-2 text-background uppercase text-sm">
          Lat - {lat?.toFixed(4)}
        </span>{" "}
        <span className="px-4 py-2 border rounded-full bg-chart-2 text-background uppercase text-sm">
          Lng - {lng?.toFixed(4)}
        </span>
      </div>
    </div>
  );
};

export default Info;
