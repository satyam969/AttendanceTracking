'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Profile, AttendanceRecord } from '@/lib/supabase';
import { Users, Clock, Image, FileImage } from 'lucide-react';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [searchDate, setSearchDate] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
    fetchEmployees();
    fetchRecords();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setIsAdmin(true);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setEmployees(data);
  };

  const fetchRecords = async () => {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order('timestamp', { ascending: false });

    if (selectedEmployee !== 'all') {
      query = query.eq('user_id', selectedEmployee);
    }

    if (searchDate) {
      query = query.gte('timestamp', `${searchDate}T00:00:00`)
        .lte('timestamp', `${searchDate}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setRecords(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!isAdmin) {
    return null;
  }

  const workUpdatesCount = records.filter(r => 
    new Date(r.timestamp).toDateString() === new Date().toDateString() && 
    r.status === 'work_update'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{employees.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {records.filter(r => 
                  new Date(r.timestamp).toDateString() === new Date().toDateString() && 
                  r.status === 'check_in'
                ).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Attendance Screenshots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {records.filter(r => 
                  new Date(r.timestamp).toDateString() === new Date().toDateString() && 
                  ['check_in', 'check_out'].includes(r.status) &&
                  r.screenshot_url
                ).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Work Updates Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{workUpdatesCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance & Work Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name || employee.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-[200px]"
              />

              <Button onClick={fetchRecords}>Filter</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Employee</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Screenshot</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: any) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-2">
                        {record.profiles.full_name || record.profiles.email}
                      </td>
                      <td className="p-2">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2 capitalize">
                        {record.status.replace('_', ' ')}
                      </td>
                      <td className="p-2 max-w-xs truncate">
                        {record.description}
                      </td>
                      <td className="p-2">
                        {record.screenshot_url && (
                          <a
                            href={record.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Image className="w-4 h-4" />
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}