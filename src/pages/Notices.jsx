import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { noticeAPI } from "@/api/notices";
import { toast } from "react-toastify";
import logo from "@/assets/lnmiit-logo.png";
import ExpandableText from "@/components/ExpandableText";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingNotice, setViewingNotice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Refetch when debounced search changes
  useEffect(() => {
    fetchNotices(debouncedSearch);
  }, [debouncedSearch]);

  const fetchNotices = async (q) => {
    try {
      setLoading(true);
      const data = await noticeAPI.getAllNotices(q);
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white ">
      {/* Header */}
      <header className="bg-lnmiit-maroon text-white py-4 px-4 sm:px-8 md:px-24 shadow-md">
        <div className="container mx-auto flex flex-row justify-between items-center">
          <img
            src={logo}
            alt="LNMIIT Logo"
            className="h-12 md:h-16 bg-white p-2 rounded"
          />
          <div className="flex gap-6 items-center">
            <button
              onClick={() => navigate("/")}
              className="text-white hover:text-gray-200 font-medium"
            >
              Events
            </button>
            <button
              onClick={() => navigate("/notices")}
              className="text-white hover:text-gray-200 font-medium"
            >
              Notices
            </button>
            <Button
              onClick={() => navigate("/super-admin/login")}
              className="bg-white text-lnmiit-maroon hover:bg-gray-100"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto pt-8 px-2 sm:px-4 md:px-8">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Notices
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Stay updated with our latest notices and announcements
            </p>
            {/* Search Box */}
            <div className="mt-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices by title or description..."
                className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lnmiit-maroon"
                aria-label="Search notices"
              />
            </div>
          </div>

          {/* Notices List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {debouncedSearch
                  ? "No matching notices found"
                  : "No notices found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.map((notice) => (
                <Card
                  key={notice._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer relative"
                  onClick={() => {
                    setViewingNotice(notice);
                    setShowViewModal(true);
                  }}
                >
                  <CardContent className="p-0">
                    {notice.image && (
                      <img
                        src={notice.image}
                        alt={notice.title}
                        className="w-full h-64 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-4">
                      <CardTitle className="text-xl text-lnmiit-maroon mb-2">
                        {notice.title}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mb-2">
                        Posted: {formatDate(notice.createdAt)}
                      </p>
                      <ExpandableText text={notice.description} lines={3} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* View Notice Details Modal */}
        {showViewModal && viewingNotice && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowViewModal(false)}
          >
            <Card
              className="w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close X icon button */}
              <button
                className="absolute top-3 right-3 bg-white hover:bg-gray-100 rounded-full p-2 shadow focus:outline-none z-10"
                aria-label="Close"
                onClick={() => setShowViewModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Scrollable content wrapper */}
              <div className="max-h-[75vh] overflow-y-auto">
                {viewingNotice.image && (
                  <img
                    src={viewingNotice.image}
                    alt={viewingNotice.title}
                    className="w-full max-h-[240px] object-contain mb-3 rounded-t-lg"
                  />
                )}

                <CardHeader className="pt-0 pb-2">
                  <CardTitle className="text-xl text-lnmiit-maroon">
                    {viewingNotice.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600">Posted On</p>
                      <p className="text-sm font-medium">
                        {formatDate(viewingNotice.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Description</p>
                      <p className="text-sm">{viewingNotice.description}</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notices;
