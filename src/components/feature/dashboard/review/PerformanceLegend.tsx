// PerformanceLegend.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle, TrendingDown, XCircle } from "lucide-react";

const PerformanceLegend = () => {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
            </Badge>
            <span>Excellent (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
            </Badge>
            <span>Good (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
            </Badge>
            <span>Average (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
            </Badge>
            <span>Poor (Below 40%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceLegend;
