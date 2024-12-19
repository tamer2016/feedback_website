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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    customer_name: "",
    country: "",
    rating: 5,
  });

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

  const handleSubmitReview = async () => {
    if (!newReview.customer_name || !newReview.country || !newReview.rating) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const { error } = await supabase.from('reviews').insert({
        ...newReview,
        user_id: user.id
      });

      if (error) throw error;

      toast.success("تم إضافة التقييم بنجاح");
      setIsDialogOpen(false);
      setNewReview({ customer_name: "", country: "", rating: 5 });
      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error("حدث خطأ أثناء إضافة التقييم");
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">تقييمات العملاء</h2>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
                إضافة تقييم جديد
              </Button>
            </div>

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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة تقييم جديد</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer_name">اسم العميل</Label>
                  <Input
                    id="customer_name"
                    value={newReview.customer_name}
                    onChange={(e) => setNewReview({ ...newReview, customer_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">البلد</Label>
                  <Input
                    id="country"
                    value={newReview.country}
                    onChange={(e) => setNewReview({ ...newReview, country: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">التقييم (من 5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitReview} className="w-full">
                  إضافة التقييم
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Index;