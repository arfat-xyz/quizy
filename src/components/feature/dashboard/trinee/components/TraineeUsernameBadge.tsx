import { Badge } from "@/components/ui/badge";

interface TraineeUsernameBadgeProps {
  username: string;
}

const TraineeUsernameBadge = ({ username }: TraineeUsernameBadgeProps) => {
  return (
    <Badge variant="outline" className="font-mono">
      {username}
    </Badge>
  );
};

export default TraineeUsernameBadge;
