"use client";

import Link from "next/link";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { Badge } from "../ui/badge";

export function AnalysisCard(analysis: AnalysisDb<AnalysisResult>) {
  return (
    <Card className="break-inside-avoid-column rounded-lg overflow-hidden py-0 gap-0 ">
      <CardContent className="p-0 relative">
        <AspectRatio ratio={1} className="w-full">
          <img
            src={analysis.data.screenshotUrl}
            alt={analysis.data.analysis.summary.slice(0, 25)}
            className="object-cover object-left-top bg-primary"
          />
        </AspectRatio>
        <Badge className="absolute top-2 left-2 z-10">
          {new Date(analysis.$createdAt).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Badge>
        <CardHeader className="flex flex-col justify-end bottom-0 absolute w-full p-4 h-full bg-linear-to-t from-background to-background/30">
          <CardTitle>
            <Button
              className="p-0! text-base text-wrap whitespace-normal h-auto text-foreground"
              variant="link"
              asChild
            >
              <Link
                href={`/app/teams/${analysis.teamId}/analysis/${analysis.$id}`}
              >
                {analysis.data.analysis.summary.slice(0, 25)}...
              </Link>
            </Button>
          </CardTitle>
          <p className="flex flex-row  text-xs items-center">
            {analysis.data.url}
          </p>
          <p className="z-10 flex flex-row gap-2 text-xs items-center w-full text-muted-foreground">
            <span className="max-w-1/2 truncate">{analysis.team?.name}</span>/
            <span className="max-w-1/2 truncate">{analysis.user?.name}</span>
          </p>
        </CardHeader>
      </CardContent>
    </Card>
  );
}
