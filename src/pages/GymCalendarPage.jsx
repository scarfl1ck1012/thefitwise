import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays, Clock3, Camera, Image as ImageIcon, Route, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MiniRouteMap } from "@/pages/GymPage";
import { toast } from "sonner";

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function getMonthDays(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => new Date(year, month, i + 1));
}

function addMinutesToTime(dateLike, mins) {
  const end = new Date(dateLike);
  end.setMinutes(end.getMinutes() + mins);
  return end;
}

export default function GymCalendarPage() {
  const { user } = useAuth();
  const { checkins } = useWorkouts();
  const [cursorMonth, setCursorMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [photos, setPhotos] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const monthDays = useMemo(() => getMonthDays(cursorMonth), [cursorMonth]);

  useEffect(() => {
    const loadPhotos = async () => {
      if (!user?.id) return;
      const basePath = `workout-progress/${user.id}/${selectedDate}`;
      const { data, error } = await supabase.storage.from("avatars").list(basePath, {
        limit: 10,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error || !data) {
        setPhotos([]);
        return;
      }
      const urls = data.map((file) => ({
        name: file.name,
        url: supabase.storage.from("avatars").getPublicUrl(`${basePath}/${file.name}`).data.publicUrl,
      }));
      setPhotos(urls);
    };
    loadPhotos();
  }, [selectedDate, user?.id]);

  const selectedEntries = useMemo(() => {
    return checkins
      .filter((entry) => entry.logged_at === selectedDate)
      .map((entry) => {
        const start = new Date(entry.created_at || `${entry.logged_at}T14:30:00`);
        const end = addMinutesToTime(start, entry.duration_min || 60);
        const startStr = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const endStr = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const kind =
          entry.workout_type === "cardio"
            ? "Cardio"
            : entry.workout_type === "home"
              ? "Home"
              : "Gym";
        return {
          id: entry.id,
          kind,
          range: `${startStr} - ${endStr}`,
          detail: entry.notes || `${kind} session`,
          routeKm: (() => {
            const match = (entry.notes || "").match(/(\d+(\.\d+)?)\s?km/i);
            return match ? match[1] : null;
          })(),
        };
      })
      .sort((a, b) => a.range.localeCompare(b.range));
  }, [checkins, selectedDate]);

  const selectedCardio = selectedEntries.find((entry) => entry.kind === "Cardio");

  const handleUploadClick = () => fileInputRef.current?.click();

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    if (photos.length >= 2) return;
    const path = `workout-progress/${user.id}/${selectedDate}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: false,
    });
    if (!error) {
      const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      setPhotos((prev) => [...prev, { name: file.name, url }].slice(0, 2));
    }
    event.target.value = "";
  };

  const handleDeletePhoto = async () => {
    if (!previewPhoto || !user?.id) return;
    const fileName = decodeURIComponent(previewPhoto.split("/").pop().split("?")[0]);
    const path = `workout-progress/${user.id}/${selectedDate}/${fileName}`;
    
    // Removing the file from Supabase storage
    const { error } = await supabase.storage.from("avatars").remove([path]);
    
    if (error) {
      toast.error("Failed to delete photo.");
    } else {
      setPhotos((prev) => prev.filter((p) => p.url !== previewPhoto));
      setPreviewPhoto(null);
      toast.success("Photo deleted.");
    }
  };

  const routeHistory = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("fitwise_route_history") || "[]");
    } catch {
      return [];
    }
  }, []);

  const cardioRoute = selectedCardio ? routeHistory.find(r => r.date === selectedDate) : null;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Workout Calendar Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Date-first view for workout and cardio sessions.
          </p>
        </div>
        <Link to="/gym">
          <Button variant="outline" className="rounded-xl">Back to Gym</Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-card p-5 lg:p-6 border border-border/30 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCursorMonth(
                (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
              )
            }
            className="h-9 w-9 rounded-full bg-surface border border-border/30 flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {cursorMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Select a day
            </p>
          </div>
          <button
            onClick={() =>
              setCursorMonth(
                (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
              )
            }
            className="h-9 w-9 rounded-full bg-surface border border-border/30 flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
            <div key={`${d}-${idx}`} className="text-center text-[10px] font-bold text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day) => {
            const key = formatDateKey(day);
            const isSelected = selectedDate === key;
            const hasData = checkins.some((c) => c.logged_at === key);
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={`h-11 rounded-xl border text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary/40"
                    : hasData
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-surface text-muted-foreground border-border/30 hover:text-foreground"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[2rem] bg-card p-5 lg:p-6 border border-border/30 shadow-card"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground">
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button
              onClick={handleUploadClick}
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={photos.length >= 2}
            >
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
        </div>

        {selectedCardio && (
          <div className="mb-4 rounded-[1.5rem] bg-gradient-to-br from-info/15 to-primary/10 border border-info/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-info font-bold">Cardio Summary</p>
                <p className="text-lg font-bold text-foreground mt-1">{selectedCardio.detail}</p>
              </div>
              <Badge variant="outline" className="border-info/40 text-info">
                {selectedCardio.range}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="rounded-xl bg-background/70 px-3 py-2 border border-border/30">
                <span className="text-muted-foreground">Route</span>
                <p className="font-bold text-foreground flex items-center gap-2 mt-1">
                  <Route className="h-4 w-4 text-info" />
                  {selectedCardio.routeKm ? `${selectedCardio.routeKm} km tracked` : "GPS cardio session"}
                </p>
              </div>
            </div>
            {cardioRoute && cardioRoute.points?.length > 1 && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="mt-3 cursor-pointer hover:bg-background/80 transition-colors p-2 rounded-2xl border border-transparent hover:border-info/30">
                    <MiniRouteMap points={cardioRoute.points} />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium flex items-center justify-center gap-1">
                      <Route className="w-3 h-3" /> Click to map full route
                    </p>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] lg:max-w-4xl bg-card border-none rounded-3xl overflow-hidden p-0 h-[80vh]">
                  <div className="h-full w-full bg-surface-lowest">
                     <MiniRouteMap points={cardioRoute.points} />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {!!photos.length && (
          <div className="mb-4 flex items-center gap-2">
            {photos.map((photo) => (
              <button
                key={photo.url}
                onClick={() => setPreviewPhoto(photo.url)}
                className="h-10 w-10 rounded-xl border border-border/30 bg-surface flex items-center justify-center"
                title="Open progress photo"
              >
                <ImageIcon className="h-4 w-4 text-primary" />
              </button>
            ))}
            <p className="text-xs text-muted-foreground">Up to 2 progress photos per day</p>
          </div>
        )}

        <div className="space-y-3">
          {selectedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions logged on this date.</p>
          ) : (
            selectedEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border/30 bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {entry.range}
                  </div>
                  <Badge variant="outline">{entry.kind}</Badge>
                </div>
                <p className="text-sm font-semibold text-foreground mt-2">{entry.detail}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="sm:max-w-xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Progress Photo</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <img
              src={previewPhoto}
              alt="Progress"
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
          )}
          {previewPhoto && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleDeletePhoto} variant="destructive" className="rounded-xl">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Photo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
