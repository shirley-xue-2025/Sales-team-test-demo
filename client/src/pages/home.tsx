import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

const Home: React.FC = () => {
  const { data: roleCount } = useQuery<number>({
    queryKey: ['/api/roles/count'],
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Team Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the sales team management system. Manage your team's roles and permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Sales Roles</h3>
              <p className="text-gray-500">
                {roleCount !== undefined ? `${roleCount} roles configured` : 'Loading roles...'}
              </p>
              <Link href="/roles">
                <Button className="mt-2 w-full">
                  Manage Roles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8" cy="7" r="4"></circle>
                  <line x1="18" y1="8" x2="23" y2="13"></line>
                  <line x1="23" y1="8" x2="18" y2="13"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Team Assignment</h3>
              <p className="text-gray-500">
                Assign team members to roles
              </p>
              <Button variant="outline" disabled className="mt-2 w-full">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="rounded-full bg-amber-100 p-3 w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Permission Settings</h3>
              <p className="text-gray-500">
                Configure detailed permissions
              </p>
              <Button variant="outline" disabled className="mt-2 w-full">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
