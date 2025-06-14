
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BlogSidebarWidgetProps {
  title: string;
  children: React.ReactNode;
}

const BlogSidebarWidget: React.FC<BlogSidebarWidgetProps> = ({ title, children }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default BlogSidebarWidget;
