import React, { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  Flame,
  Check,
  X,
  UserMinus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FriendsView({
  users,
  friendships,
  requests,
  currentUser,
  onAccept,
  onDecline,
  onRemove,
  onAdd,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequests, setShowRequests] = useState(true);

  // Current Friends
  const friendsList = useMemo(() => {
    const friendIds = friendships
      .filter((f) => f.userId === currentUser.id)
      .map((f) => f.friendId);
    return users.filter((u) => friendIds.includes(u.id));
  }, [users, friendships, currentUser]);

  // Incoming Requests
  const pendingRequests = useMemo(() => {
    const senderIds = requests
      .filter((r) => r.receiverId === currentUser.id)
      .map((r) => r.senderId);
    return users.filter((u) => senderIds.includes(u.id));
  }, [users, requests, currentUser]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return users
      .filter(
        (u) =>
          u.id !== currentUser.id &&
          u.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5); // Max 5 results
  }, [users, searchQuery, currentUser]);

  const isFriend = (targetId) =>
    friendships.some(
      (f) => f.userId === currentUser.id && f.friendId === targetId,
    );
  const hasRequested = (targetId) =>
    requests.some(
      (r) => r.senderId === currentUser.id && r.receiverId === targetId,
    );
  const hasIncoming = (targetId) =>
    requests.some(
      (r) => r.senderId === targetId && r.receiverId === currentUser.id,
    );

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Search Bar */}
      <div className="relative z-20">
        <div className="relative flex items-center bg-card border border-border rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            type="text"
            placeholder="Search users to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Search Dropdown Results */}
        {searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No users found.
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  {isFriend(user.id) ? (
                    <span className="text-xs font-semibold text-muted-foreground px-2">
                      Friends
                    </span>
                  ) : hasIncoming(user.id) ? (
                    <span className="text-xs font-semibold text-primary px-2">
                      Review Request
                    </span>
                  ) : hasRequested(user.id) ? (
                    <span className="text-xs font-semibold text-muted-foreground px-2">
                      Pending
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onAdd(user.id)}
                      className="gap-1 h-8 px-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-card/80 transition-colors"
            onClick={() => setShowRequests(!showRequests)}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Friend Requests</h3>
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            </div>
            {showRequests ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showRequests && (
            <div className="px-4 pb-4 space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <img
                      src={req.avatar}
                      alt={req.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-sm">{req.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        Level {req.level} •{" "}
                        <Flame className="w-3 h-3 text-orange-500" />{" "}
                        {req.streak}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onDecline(req.id)}
                      className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => onAccept(req.id)}
                      className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friends List Grid */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 px-1">
          Your Friends ({friendsList.length})
        </h3>
        {friendsList.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
            You don't have any friends yet. Use the search bar to find some!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendsList.map((friend) => (
              <div
                key={friend.id}
                className="bg-card border border-border/50 rounded-xl p-4 flex flex-col hover:border-border transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full ring-2 ring-background border border-border/50"
                    />
                    <div>
                      <div className="font-semibold text-foreground line-clamp-1">
                        {friend.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Level {friend.level}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(friend.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-md"
                    title="Remove Friend"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm bg-background/50 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5 flex-1">
                    <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="font-medium">
                      {friend.streak}{" "}
                      <span className="text-muted-foreground text-xs font-normal">
                        Day Streak
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="font-bold text-primary">
                      {Math.floor(friend.xp / 1000)}k
                    </span>
                    <span className="text-muted-foreground text-xs font-normal ml-1">
                      XP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
