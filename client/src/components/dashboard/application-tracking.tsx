import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Application, Job } from "@shared/schema";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Link } from "wouter";

interface ApplicationWithJob extends Application {
  job?: Job;
}

interface ApplicationTrackingProps {
  applications: ApplicationWithJob[];
  isLoading?: boolean;
}

export function ApplicationTracking({ applications, isLoading }: ApplicationTrackingProps) {
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Your Applications</CardTitle>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  You haven't applied to any internships yet.
                </TableCell>
              </TableRow>
            ) : (
              applications.slice(0, 3).map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {application.job?.title || "Unknown Position"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {application.job?.employerName || "Unknown Company"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(application.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(application.status).bg
                      } ${getStatusColor(application.status).text}`}
                    >
                      {getStatusLabel(application.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button variant="link" className="text-primary-500 hover:text-primary-700 p-0 h-auto">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <CardFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <Link href="/applications" className="text-sm font-medium text-primary-500 hover:text-primary-600">
          View all applications
          <ChevronRight className="h-4 w-4 inline ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
