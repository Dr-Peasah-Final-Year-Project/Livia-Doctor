import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface UserAvatarProps {
  /** Image URL — falls back to a boring avatar when absent */
  src?: string | null;
  /** Seed for the generated fallback avatar */
  seed: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function UserAvatar({ src, seed, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback>
        <img
          src={`https://api.dicebear.com/10.x/glass/svg?seed=${seed}`}
          alt="User Avatar"
          className="rounded-full"
        />
      </AvatarFallback>
    </Avatar>
  );
}
