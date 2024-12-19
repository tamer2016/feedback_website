import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate("/auth");
      }
    };

    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
          <p className="text-gray-600">
            You are now logged in to your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;