import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Review {
  id: string;
  customer_name: string;
  country: string;
  rating: number;
  review_date: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchReviews();
      } else {
        navigate("/auth");
      }
    };

    getUser();
  }, [navigate]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('review_date', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        toast.error("حدث خطأ أثناء جلب التقييمات");
        return;
      }

      setReviews(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("حدث خطأ أثناء جلب التقييمات");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">مرحباً، {user.email}</h1>
            <Button onClick={handleLogout} variant="outline">
              تسجيل الخروج
            </Button>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">تقييمات العملاء</h2>
            {loading ? (
              <p className="text-center text-gray-600">جاري التحميل...</p>
            ) : reviews.length === 0 ? (
              <p className="text-center text-gray-600">لا توجد تقييمات حالياً</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>البلد</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>تاريخ التقييم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{review.customer_name}</TableCell>
                      <TableCell>{review.country}</TableCell>
                      <TableCell>{review.rating} / 5</TableCell>
                      <TableCell>
                        {new Date(review.review_date).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;