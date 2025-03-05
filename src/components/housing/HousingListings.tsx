
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Home, MapPin, Calendar, DollarSign, Bath, BedDouble, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface HousingListing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  move_in_date: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  image_urls: string[] | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  owner?: {
    full_name: string;
    profile_image_url: string | null;
  };
}

export const HousingListings = () => {
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<HousingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [locationFilter, setLocationFilter] = useState("");
  const [bedroomsFilter, setBedroomsFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListing, setNewListing] = useState<{
    title: string;
    description: string;
    location: string;
    price: number;
    move_in_date: string;
    bedrooms: number;
    bathrooms: number;
  }>({
    title: "",
    description: "",
    location: "",
    price: 0,
    move_in_date: "",
    bedrooms: 1,
    bathrooms: 1,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('housing_listings')
          .select(`
            *,
            owner:owner_id(
              full_name,
              profile_image_url
            )
          `)
          .eq('is_available', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setListings(data || []);
        setFilteredListings(data || []);
        
        // Set initial price range based on data
        if (data && data.length > 0) {
          const prices = data.map(l => l.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (error) {
        console.error('Error fetching housing listings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:housing_listings')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'housing_listings'
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch owner info for the new listing
          const { data: ownerData } = await supabase
            .from('profiles')
            .select('full_name, profile_image_url')
            .eq('id', payload.new.owner_id)
            .single();
            
          const newListing = {
            ...payload.new,
            owner: ownerData
          } as HousingListing;
          
          setListings(prev => [newListing, ...prev]);
          // Reapply filters
          applyFilters([newListing, ...listings]);
        } else if (payload.eventType === 'UPDATE') {
          setListings(prev => 
            prev.map(listing => 
              listing.id === payload.new.id ? { ...listing, ...payload.new } : listing
            )
          );
          // Reapply filters
          applyFilters(listings.map(listing => 
            listing.id === payload.new.id ? { ...listing, ...payload.new } : listing
          ));
        } else if (payload.eventType === 'DELETE') {
          setListings(prev => 
            prev.filter(listing => listing.id !== payload.old.id)
          );
          setFilteredListings(prev => 
            prev.filter(listing => listing.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilters(listings);
  }, [search, priceRange, locationFilter, bedroomsFilter, listings]);

  const applyFilters = (listingsToFilter: HousingListing[]) => {
    let results = [...listingsToFilter];
    
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) || 
        listing.description.toLowerCase().includes(searchLower) ||
        listing.location.toLowerCase().includes(searchLower)
      );
    }
    
    results = results.filter(listing => 
      listing.price >= priceRange[0] && 
      listing.price <= priceRange[1]
    );
    
    if (locationFilter) {
      results = results.filter(listing => 
        listing.location.includes(locationFilter)
      );
    }
    
    if (bedroomsFilter) {
      const beds = parseInt(bedroomsFilter);
      results = results.filter(listing => 
        listing.bedrooms === beds || 
        (bedroomsFilter === "4+" && listing.bedrooms && listing.bedrooms >= 4)
      );
    }
    
    setFilteredListings(results);
  };

  const getUniqueLocations = () => {
    const locations = listings.map(l => l.location);
    return [...new Set(locations)];
  };

  const handleCreateListing = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('housing_listings')
        .insert({
          owner_id: user.id,
          ...newListing,
          image_urls: []
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your housing listing has been created.",
      });
      
      setIsDialogOpen(false);
      setNewListing({
        title: "",
        description: "",
        location: "",
        price: 0,
        move_in_date: "",
        bedrooms: 1,
        bathrooms: 1,
      });
    } catch (error) {
      console.error('Error creating housing listing:', error);
      toast({
        title: "Error",
        description: "Failed to create housing listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Housing Options</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Housing Listing</DialogTitle>
              <DialogDescription>
                Post a room or apartment listing for other interns to see.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                  placeholder="e.g., Cozy Studio Near Downtown"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  placeholder="Describe your housing option"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={newListing.location}
                  onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price per month ($)</Label>
                <Input 
                  id="price" 
                  type="number"
                  value={newListing.price.toString()}
                  onChange={(e) => setNewListing({...newListing, price: Number(e.target.value)})}
                  placeholder="1500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="move_in_date">Move-in Date</Label>
                <Input 
                  id="move_in_date" 
                  type="date"
                  value={newListing.move_in_date}
                  onChange={(e) => setNewListing({...newListing, move_in_date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select 
                    value={newListing.bedrooms.toString()}
                    onValueChange={(value) => setNewListing({...newListing, bedrooms: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select 
                    value={newListing.bathrooms.toString()}
                    onValueChange={(value) => setNewListing({...newListing, bathrooms: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="3.5">3.5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateListing}>Create Listing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Filters</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Search</Label>
                <div className="relative">
                  <Input 
                    placeholder="Search listings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Price Range</Label>
                <div className="pt-2 px-2">
                  <Slider 
                    defaultValue={priceRange} 
                    max={5000}
                    step={100}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    {getUniqueLocations().map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">Bedrooms</Label>
                <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setPriceRange([0, 5000]);
                  setLocationFilter("");
                  setBedroomsFilter("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-gray-200 rounded w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    {listing.image_urls && listing.image_urls.length > 0 ? (
                      <img 
                        src={listing.image_urls[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                      {formatCurrency(listing.price)}/mo
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{listing.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {listing.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4 mb-4">
                      {listing.bedrooms && (
                        <div className="flex items-center">
                          <BedDouble className="h-4 w-4 mr-1" />
                          <span className="text-sm">{listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}</span>
                        </div>
                      )}
                      {listing.bathrooms && (
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span className="text-sm">{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
                        </div>
                      )}
                      {listing.move_in_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-sm">{new Date(listing.move_in_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm line-clamp-3">{listing.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">View Details</Button>
                    <Button 
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Sign in required",
                            description: "Please sign in to contact this listing's owner",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        toast({
                          title: "Contact info sent",
                          description: "The owner will be in touch with you soon.",
                        });
                      }}
                    >
                      Contact
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setPriceRange([0, 5000]);
                  setLocationFilter("");
                  setBedroomsFilter("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
