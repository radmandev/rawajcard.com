import React, { useState, useRef } from 'react';
import { useUpgrade } from '@/lib/UpgradeContext';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Eye, 
  Edit3, 
  Trash2,
  Clock,
  Activity,
  Settings as SettingsIcon,
  Crown,
  Building2,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TeamManagement() {
  const { t, isRTL } = useLanguage();
  const { openUpgradeDialog } = useUpgrade();
  const queryClient = useQueryClient();
  
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    company_name_ar: '',
    company_tagline: '',
    company_tagline_ar: '',
    company_logo: '',
    company_website: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_address_ar: '',
    google_maps_link: '',
    show_on_cards: true
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await api.entities.Subscription.list();
      return subs[0] || { plan: 'free', card_limit: 1, status: 'active' };
    }
  });

  const isPremium = subscription?.plan === 'premium';

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.entities.Team.list(),
    enabled: isPremium
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', selectedTeam?.id],
    queryFn: () => api.entities.TeamMember.filter({ team_id: selectedTeam?.id }),
    enabled: !!selectedTeam
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activity-logs', selectedTeam?.id],
    queryFn: () => api.entities.ActivityLog.filter({ team_id: selectedTeam?.id }, '-created_date', 50),
    enabled: !!selectedTeam
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data) => {
      const team = await api.entities.Team.create(data);
      await api.entities.TeamMember.create({
        team_id: team.id,
        user_email: user.email,
        user_name: user.full_name,
        role: 'admin',
        status: 'active',
        invited_by: user.email,
        permissions: {
          can_create_cards: true,
          can_edit_cards: true,
          can_delete_cards: true,
          can_view_contacts: true,
          can_export_contacts: true,
          can_invite_members: true
        }
      });
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowCreateTeam(false);
      setNewTeamName('');
      setNewTeamDesc('');
      toast.success(isRTL ? 'تم إنشاء الفريق' : 'Team created');
    }
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data) => {
      const member = await api.entities.TeamMember.create(data);
      await api.entities.ActivityLog.create({
        team_id: selectedTeam.id,
        user_email: user.email,
        user_name: user.full_name,
        action_type: 'member_invited',
        resource_type: 'member',
        resource_id: member.id,
        details: `Invited ${data.user_name} as ${data.role}`
      });
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      setShowInviteMember(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('viewer');
      toast.success(isRTL ? 'تم إرسال الدعوة' : 'Invitation sent');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }) => {
      await api.entities.TeamMember.update(memberId, { role });
      await api.entities.ActivityLog.create({
        team_id: selectedTeam.id,
        user_email: user.email,
        user_name: user.full_name,
        action_type: 'role_changed',
        resource_type: 'member',
        resource_id: memberId,
        details: `Changed role to ${role}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(isRTL ? 'تم التحديث' : 'Updated');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId) => {
      await api.entities.TeamMember.delete(memberId);
      await api.entities.ActivityLog.create({
        team_id: selectedTeam.id,
        user_email: user.email,
        user_name: user.full_name,
        action_type: 'member_removed',
        resource_type: 'member',
        resource_id: memberId,
        details: 'Removed team member'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(isRTL ? 'تم الإزالة' : 'Removed');
    }
  });

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error(isRTL ? 'أدخل اسم الفريق' : 'Enter team name');
      return;
    }
    createTeamMutation.mutate({
      name: newTeamName,
      description: newTeamDesc,
      owner_email: user.email
    });
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error(isRTL ? 'أدخل البريد الإلكتروني والاسم' : 'Enter email and name');
      return;
    }

    const rolePermissions = {
      admin: {
        can_create_cards: true,
        can_edit_cards: true,
        can_delete_cards: true,
        can_view_contacts: true,
        can_export_contacts: true,
        can_invite_members: true
      },
      editor: {
        can_create_cards: true,
        can_edit_cards: true,
        can_delete_cards: false,
        can_view_contacts: true,
        can_export_contacts: true,
        can_invite_members: false
      },
      viewer: {
        can_create_cards: false,
        can_edit_cards: false,
        can_delete_cards: false,
        can_view_contacts: true,
        can_export_contacts: false,
        can_invite_members: false
      }
    };

    inviteMemberMutation.mutate({
      team_id: selectedTeam.id,
      user_email: inviteEmail,
      user_name: inviteName,
      role: inviteRole,
      status: 'pending',
      invited_by: user.email,
      permissions: rolePermissions[inviteRole]
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'editor': return <Edit3 className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      viewer: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
    };
    return variants[role] || variants.viewer;
  };

  const updateCompanyInfoMutation = useMutation({
    mutationFn: async (data) => {
      await api.entities.Team.update(selectedTeam.id, { company_info: data });
      await api.entities.ActivityLog.create({
        team_id: selectedTeam.id,
        user_email: user.email,
        user_name: user.full_name,
        action_type: 'settings_updated',
        resource_type: 'team',
        resource_id: selectedTeam.id,
        details: 'Updated company information'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      setShowCompanyInfo(false);
      toast.success(isRTL ? 'تم التحديث' : 'Updated');
    }
  });

  const logoInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploadingLogo(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      if (file_url) {
        setCompanyInfo((prev) => ({ ...prev, company_logo: file_url }));
        toast.success(isRTL ? 'تم رفع الشعار' : 'Logo uploaded');
      } else {
        throw new Error('No URL returned');
      }
    } catch (error) {
      toast.error(isRTL ? 'فشل رفع الشعار' : 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  React.useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]);
    }
  }, [teams]);

  React.useEffect(() => {
    if (selectedTeam?.company_info) {
      setCompanyInfo(selectedTeam.company_info);
    }
  }, [selectedTeam]);

  // Premium gate
  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="text-center py-12">
            <Crown className="h-20 w-20 mx-auto text-amber-500 mb-6" />
            <h2 className="text-2xl font-bold mb-3">
              {isRTL ? 'ميزة بريميوم' : 'Premium Feature'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {isRTL 
                ? 'إدارة الفريق متاحة فقط لمستخدمي البريميوم. قم بالترقية للوصول إلى التعاون الجماعي وإدارة البطاقات المشتركة.'
                : 'Team management is available for Premium users only. Upgrade to access team collaboration and shared card management.'
              }
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={openUpgradeDialog}>
              <Crown className="h-4 w-4 mr-2" />
              {isRTL ? 'الترقية إلى بريميوم' : 'Upgrade to Premium'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {isRTL ? 'إدارة الفريق' : 'Team Management'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isRTL ? 'تعاون مع فريقك على البطاقات وجهات الاتصال' : 'Collaborate with your team on cards and contacts'}
          </p>
        </div>
        {teams.length === 0 && (
          <Button onClick={() => setShowCreateTeam(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            {isRTL ? 'إنشاء فريق' : 'Create Team'}
          </Button>
        )}
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{isRTL ? 'لا توجد فرق' : 'No teams yet'}</h3>
            <p className="text-slate-500 mb-4">
              {isRTL ? 'أنشئ فريقك الأول للتعاون' : 'Create your first team to start collaborating'}
            </p>
            <Button onClick={() => setShowCreateTeam(true)} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إنشاء فريق' : 'Create Team'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Team Info Card */}
          <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-800">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedTeam?.company_info?.company_logo ? (
                    <img src={selectedTeam.company_info.company_logo} alt="Logo" className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedTeam?.name}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedTeam?.description}</p>
                    {selectedTeam?.company_info?.company_name && (
                      <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                        {selectedTeam.company_info.company_name}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowCompanyInfo(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  {isRTL ? 'معلومات الشركة' : 'Company Info'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                {isRTL ? 'الأعضاء' : 'Members'}
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                {isRTL ? 'النشاط' : 'Activity'}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className="h-4 w-4 mr-2" />
                {isRTL ? 'الإعدادات' : 'Settings'}
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{isRTL ? 'أعضاء الفريق' : 'Team Members'}</CardTitle>
                    <Button onClick={() => setShowInviteMember(true)} size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      {isRTL ? 'دعوة عضو' : 'Invite Member'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {member.user_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{member.user_name}</p>
                            <p className="text-sm text-slate-500">{member.user_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getRoleBadge(member.role)}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1 capitalize">{member.role}</span>
                          </Badge>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                          {member.user_email !== user?.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMemberMutation.mutate(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'سجل النشاط' : 'Activity Log'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'تتبع جميع الإجراءات في الفريق' : 'Track all actions in your team'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.user_name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{log.details}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <p className="text-xs text-slate-400">
                              {format(new Date(log.created_date), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {log.action_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'إعدادات الفريق' : 'Team Settings'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'يمكنك إنشاء فريق واحد فقط لشركتك' : 'You can create one team for your company'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{isRTL ? 'اسم الفريق' : 'Team Name'}</Label>
                    <Input value={selectedTeam?.name} className="mt-2" disabled />
                  </div>
                  <div>
                    <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
                    <Input value={selectedTeam?.description || ''} className="mt-2" disabled />
                  </div>
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{isRTL ? 'السماح بإنشاء البطاقات' : 'Allow Card Creation'}</p>
                        <p className="text-sm text-slate-500">{isRTL ? 'السماح للأعضاء بإنشاء بطاقات' : 'Allow members to create cards'}</p>
                      </div>
                      <Switch defaultChecked={selectedTeam?.settings?.allow_card_creation ?? true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{isRTL ? 'السماح بتصدير جهات الاتصال' : 'Allow Contact Export'}</p>
                        <p className="text-sm text-slate-500">{isRTL ? 'السماح بتصدير البيانات' : 'Allow exporting contact data'}</p>
                      </div>
                      <Switch defaultChecked={selectedTeam?.settings?.allow_contact_export ?? true} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إنشاء فريق جديد' : 'Create Your Team'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'يمكنك إنشاء فريق واحد فقط لشركتك' : 'You can create one team for your company'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isRTL ? 'اسم الفريق/الشركة' : 'Team/Company Name'}</Label>
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder={isRTL ? 'اسم شركتك' : 'Your company name'}
                className="mt-2"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}</Label>
              <Textarea
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                placeholder={isRTL ? 'وصف قصير عن شركتك' : 'Brief description about your company'}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={createTeamMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {createTeamMutation.isPending ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Info Dialog */}
      <Dialog open={showCompanyInfo} onOpenChange={setShowCompanyInfo}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'معلومات الشركة' : 'Company Information'}</DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'هذه المعلومات ستظهر على بطاقات الأعضاء المعينين'
                : 'This information will be shown on assigned members cards'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isRTL ? 'شعار الشركة' : 'Company Logo'}</Label>
              <div className="mt-2 flex items-center gap-4">
                {companyInfo.company_logo ? (
                  <div className="relative">
                    <img src={companyInfo.company_logo} alt="Logo" className="h-20 w-20 rounded-lg object-cover" />
                    <button
                      onClick={() => setCompanyInfo({ ...companyInfo, company_logo: '' })}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <Button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-2"
                >
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingLogo ? (isRTL ? 'جارٍ الرفع...' : 'Uploading...') : (isRTL ? 'رفع شعار' : 'Upload Logo')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'اسم الشركة' : 'Company Name'}</Label>
                <Input
                  value={companyInfo.company_name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>{isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</Label>
                <Input
                  value={companyInfo.company_name_ar}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_name_ar: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'شعار الشركة' : 'Tagline'}</Label>
                <Input
                  value={companyInfo.company_tagline}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_tagline: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>{isRTL ? 'شعار الشركة (عربي)' : 'Tagline (Arabic)'}</Label>
                <Input
                  value={companyInfo.company_tagline_ar}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_tagline_ar: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'الموقع الإلكتروني' : 'Website'}</Label>
                <Input
                  value={companyInfo.company_website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_website: e.target.value })}
                  className="mt-2"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input
                  value={companyInfo.company_email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_email: e.target.value })}
                  className="mt-2"
                  placeholder="info@company.com"
                />
              </div>
            </div>

            <div>
              <Label>{isRTL ? 'رقم الهاتف' : 'Phone'}</Label>
              <Input
                value={companyInfo.company_phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, company_phone: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'العنوان' : 'Address'}</Label>
                <Textarea
                  value={companyInfo.company_address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_address: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              </div>
              <div>
                <Label>{isRTL ? 'العنوان (عربي)' : 'Address (Arabic)'}</Label>
                <Textarea
                  value={companyInfo.company_address_ar}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_address_ar: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label>{isRTL ? 'رابط خرائط جوجل' : 'Google Maps Link'}</Label>
              <Input
                value={companyInfo.google_maps_link}
                onChange={(e) => setCompanyInfo({ ...companyInfo, google_maps_link: e.target.value })}
                className="mt-2"
                placeholder="https://maps.google.com/..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {isRTL 
                  ? 'الصق رابط موقعك من خرائط جوجل'
                  : 'Paste your Google Maps location link'
                }
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <div>
                <p className="font-medium">{isRTL ? 'إظهار على البطاقات' : 'Show on Cards'}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isRTL 
                    ? 'إظهار معلومات الشركة على بطاقات الأعضاء افتراضياً'
                    : 'Show company info on members cards by default'
                  }
                </p>
              </div>
              <Switch
                checked={companyInfo.show_on_cards}
                onCheckedChange={(checked) => setCompanyInfo({ ...companyInfo, show_on_cards: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompanyInfo(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => updateCompanyInfoMutation.mutate(companyInfo)}
              disabled={updateCompanyInfoMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {updateCompanyInfoMutation.isPending ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'دعوة عضو' : 'Invite Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={isRTL ? 'email@example.com' : 'email@example.com'}
                className="mt-2"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الاسم' : 'Name'}</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder={isRTL ? 'الاسم الكامل' : 'Full name'}
                className="mt-2"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الدور' : 'Role'}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin - {isRTL ? 'صلاحيات كاملة' : 'Full access'}
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Editor - {isRTL ? 'إنشاء وتعديل' : 'Create & edit'}
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Viewer - {isRTL ? 'عرض فقط' : 'View only'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteMember(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleInviteMember}
              disabled={inviteMemberMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {inviteMemberMutation.isPending ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : (isRTL ? 'إرسال دعوة' : 'Send Invite')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}