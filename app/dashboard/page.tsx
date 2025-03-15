'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/lib/supabase';
import { Camera, Upload, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [workDescription, setWorkDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchRecords();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
    } else {
      setUser(user);
      const lastRecord = await getLastRecord(user.id);
      setIsCheckedIn(lastRecord?.status === 'check_in');
    }
  };

  const getLastRecord = async (userId: string) => {
    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    return data;
  };

  const fetchRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      if (data) setRecords(data);
    }
  };

  const handleAttendance = async () => {
    if (!attendanceFile) {
      toast({
        title: 'Error',
        description: 'Please select a screenshot to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload screenshot to Supabase Storage
      const filename = `attendance_${Date.now()}_${attendanceFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, attendanceFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filename);

      // Record attendance
      const status = isCheckedIn ? 'check_out' : 'check_in';
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          user_id: user.id,
          status,
          screenshot_url: publicUrl,
        });

      if (error) throw error;

      setIsCheckedIn(!isCheckedIn);
      setAttendanceFile(null);
      fetchRecords();
      toast({
        title: 'Success',
        description: `Successfully ${status.replace('_', 'ed ')}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkScreenshotUpload = async () => {
    if (!selectedFile || !workDescription) {
      toast({
        title: 'Error',
        description: 'Please select a file and add a description of your work',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload work screenshot to Supabase Storage
      const filename = `work_${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filename);

      // Record work update
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          user_id: user.id,
          status: 'work_update',
          screenshot_url: publicUrl,
          description: workDescription
        });

      if (error) throw error;

      setSelectedFile(null);
      setWorkDescription('');
      fetchRecords();
      toast({
        title: 'Success',
        description: 'Work update submitted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setAttendanceFile(e.target.files?.[0] || null)}
              className="mb-4"
            />
            <Button
              onClick={handleAttendance}
              disabled={isLoading || !attendanceFile}
              className="w-full flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {isLoading ? 'Processing...' : isCheckedIn ? 'Check Out & Upload Screenshot' : 'Check In & Upload Screenshot'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Work Screenshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mb-4"
              />
            </div>
            <div>
              <Textarea
                placeholder="Describe the work you've completed (e.g., 'Completed UI/UX design for the dashboard in Figma')"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="mb-4"
                rows={4}
              />
            </div>
            <Button
              onClick={handleWorkScreenshotUpload}
              disabled={isLoading || !selectedFile || !workDescription}
              className="w-full flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {isLoading ? 'Uploading...' : 'Upload Work Screenshot'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Screenshot</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-2">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2 capitalize">
                        {record.status.replace('_', ' ')}
                      </td>
                      <td className="p-2">
                      {(record as any).description}
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