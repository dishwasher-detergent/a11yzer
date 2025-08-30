"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { AspectRatio } from "../ui/aspect-ratio";

export function AnalysisCard(analysis: AnalysisDb<AnalysisResult>) {
  return (
    <Card className="break-inside-avoid-column rounded-lg overflow-hidden py-0 gap-0 ">
      <CardContent className="p-0 relative">
        <AspectRatio ratio={1} className="w-full">
          {analysis.data.screenshotUrl ? (
            <img
              src={analysis.data.screenshotUrl}
              alt={analysis.data.analysis.summary.slice(0, 50)}
              className="object-cover object-left-top bg-primary"
            />
          ) : (
            <div className="w-full aspect-square bg-muted grid place-items-center">
              <p className="text-muted-foreground font-semibold">
                No Screenshot
              </p>
            </div>
          )}
        </AspectRatio>
        <CardHeader className="flex flex-col justify-end bottom-0 absolute w-full p-4 h-full bg-linear-to-t from-primary to-primary/20">
          <CardTitle className="text-primary-foreground">
            <Button
              className="p-0! text-primary-foreground text-base text-wrap whitespace-normal h-auto"
              variant="link"
              asChild
            >
              <Link
                href={`/app/teams/${analysis.teamId}/analysis/${analysis.$id}`}
              >
                {analysis.data.analysis.summary.slice(0, 50)}...
              </Link>
            </Button>
          </CardTitle>
          <CardDescription className="text-primary-foreground text-xs">
            {new Date(analysis.$createdAt).toLocaleDateString("en-US")}
          </CardDescription>
        </CardHeader>
      </CardContent>
    </Card>
  );
}
