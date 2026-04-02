"use client";

import { useEffect, useState, useTransition } from "react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { TopBar } from "@/components/layout/top-bar";
import { getUsers, createUserAccount, deleteUserAccount, updateUserRole, updateUserProfile, UserRole } from "@/actions/account-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  UserPlus, 
  UserCog, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  Mail, 
  User as UserIcon,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function AccountManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "cashier" as UserRole
  });

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "cashier" as UserRole
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getUsers();
    if (result.success) {
      setUsers(result.users || []);
    } else {
      toast.error("Gagal memuat pengguna");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createUserAccount(formData.email, formData.name, formData.role);
      if (result.success) {
        toast.success("User Account Created Successfully", {
          description: `Account for ${formData.name} is now active. Default password: JuRasa2026!`
        });
        setIsDialogOpen(false);
        setFormData({ name: "", email: "", role: "cashier" });
        fetchUsers();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    startTransition(async () => {
      const result = await updateUserProfile(editingUser.id, {
        name: editFormData.name,
        role: editFormData.role
      });
      
      if (result.success) {
        toast.success("Profile Updated Successfully", {
          description: `${editFormData.name}'s details have been updated.`
        });
        setIsEditDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleOpenEditDialog = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role as UserRole
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (!confirm(`Hapus akun ${name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    startTransition(async () => {
      const result = await deleteUserAccount(id);
      if (result.success) {
        toast.success("Akun Berhasil Dihapus");
        fetchUsers();
      } else {
        toast.error(result.error);
      }
    });
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
            <ShieldAlert className="size-3" />
            Super Admin
          </span>
        );
      case "inventory_admin":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
            <ShieldCheck className="size-3" />
            Inventory Admin
          </span>
        );
      case "cashier":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
            <UserIcon className="size-3" />
            Cashier
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
            <ShieldQuestion className="size-3" />
            Undefined
          </span>
        );
    }
  };

  return (
    <PageWrapper>
      <TopBar />
      
      <div className="space-y-10 pb-20">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tighter italic uppercase font-headline">Account Management</h2>
            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Control User Access Boundaries & System Roles</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <button 
                className="bg-primary text-white font-black px-6 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none"
              >
                <UserPlus className="size-4" />
                Add New Staff
              </button>
            } />
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-sm">
               <form onSubmit={handleCreateUser}>
                  <DialogHeader className="p-10 pb-6 bg-surface-variant/10">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Register Staff</DialogTitle>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-2">Provision a new employee account</p>
                  </DialogHeader>
                  
                  <div className="p-10 pt-4 space-y-6">
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-1">Full Name</label>
                        <Input 
                           value={formData.name}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                           placeholder="Bagas Pramono"
                           required
                           className="h-12 rounded-xl bg-surface-variant/10 border-none font-bold placeholder:font-bold placeholder:opacity-20"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-1">Work Email</label>
                        <Input 
                           type="email"
                           value={formData.email}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                           placeholder="bagas@jurasa.id"
                           required
                           className="h-12 rounded-xl bg-surface-variant/10 border-none font-bold placeholder:font-bold placeholder:opacity-20"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-1">Standard Role</label>
                        <select 
                           value={formData.role}
                           onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                           className="w-full h-12 rounded-xl bg-surface-variant/10 border-none px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
                        >
                           <option value="super_admin">Super Admin</option>
                           <option value="inventory_admin">Inventory Admin</option>
                           <option value="cashier">Cashier</option>
                        </select>
                     </div>
                  </div>

                  <DialogFooter className="p-10 pt-0">
                     <button 
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary text-white h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                     >
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                        Finalize Account
                     </button>
                  </DialogFooter>
               </form>
            </DialogContent>
          </Dialog>

          {/* Edit Staff Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-sm">
               <form onSubmit={handleUpdateUser}>
                  <DialogHeader className="p-10 pb-6 bg-primary/5">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Edit Staff Profile</DialogTitle>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-2">Update employee details & authority</p>
                  </DialogHeader>
                  
                  <div className="p-10 pt-4 space-y-6">
                     <div className="space-y-4 opacity-50 cursor-not-allowed">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-1">Work Email (Locked)</label>
                        <Input 
                           type="email"
                           value={editFormData.email}
                           readOnly
                           className="h-12 rounded-xl bg-surface-variant/10 border-none font-bold placeholder:font-bold placeholder:opacity-20 cursor-not-allowed"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-1">Full Name</label>
                        <Input 
                           value={editFormData.name}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, name: e.target.value})}
                           placeholder="Bagas Pramono"
                           required
                           className="h-12 rounded-xl bg-surface-variant/10 border-none font-bold placeholder:font-bold placeholder:opacity-20"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-1">System Role</label>
                        <select 
                           value={editFormData.role}
                           onChange={(e) => setEditFormData({...editFormData, role: e.target.value as UserRole})}
                           className="w-full h-12 rounded-xl bg-surface-variant/10 border-none px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
                        >
                           <option value="super_admin">Super Admin</option>
                           <option value="inventory_admin">Inventory Admin</option>
                           <option value="cashier">Cashier</option>
                        </select>
                     </div>
                  </div>

                  <DialogFooter className="p-10 pt-0">
                     <button 
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary text-white h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                     >
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserCog className="size-4" />}
                        Save Changes
                     </button>
                  </DialogFooter>
               </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Information Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
           <div className="md:col-span-3 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search staff by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-white rounded-3xl pl-16 pr-6 shadow-xl border border-outline/5 outline-none font-black text-xs uppercase tracking-tight placeholder:opacity-30 focus:shadow-2xl focus:shadow-primary/5 transition-all"
              />
           </div>
           <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex flex-col justify-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-primary/60 mb-1">Population</p>
              <p className="text-xl font-black italic tracking-tighter">{users.length} Registered Accounts</p>
           </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-outline/5 overflow-hidden mx-2">
          <table className="w-full text-left">
             <thead className="bg-surface-variant/10">
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 border-b border-outline/10">
                   <th className="px-10 py-6">Staff Identity</th>
                   <th className="px-10 py-6">Role / Capabilities</th>
                   <th className="px-10 py-6">Status</th>
                   <th className="px-10 py-6 text-right pr-14">Management</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-outline/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center opacity-20"><Loader2 className="size-10 animate-spin mx-auto" /></td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center text-on-surface-variant/20 font-black uppercase tracking-widest">No staff members detected</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-surface-variant/5 transition-colors">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                             <div className="size-12 rounded-2xl bg-surface-variant/20 flex items-center justify-center font-black text-on-surface-variant text-base">
                               {user.name?.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-sm font-black uppercase italic tracking-tighter">{user.name}</p>
                                <p className="text-[10px] font-medium text-on-surface-variant/60">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          {getRoleBadge(user.role)}
                       </td>
                       <td className="px-10 py-8">
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 tracking-widest">
                             <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                             Online / Active
                          </span>
                       </td>
                       <td className="px-10 py-8 text-right pr-12">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                             <button 
                                onClick={() => handleOpenEditDialog(user)}
                                className="p-3 bg-surface-variant/20 hover:bg-white hover:text-primary hover:shadow-xl rounded-xl transition-all"
                             >
                                <UserCog className="size-4" />
                             </button>
                             <button 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-xl rounded-xl transition-all"
                             >
                                <Trash2 className="size-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))
                )}
             </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
