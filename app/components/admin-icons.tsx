"use client"

import type React from "react"
import {
  Search,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Link,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Globe,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Database,
  Server,
  Cloud,
  Shield,
  Lock,
  Unlock,
  Key,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  MessageSquare,
  Bell,
  BellOff,
  Star,
  Heart,
  Bookmark,
  Share,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  Play,
  Pause,
  CircleStopIcon as Stop,
  Volume,
  VolumeX,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  ComputerIcon as Desktop,
  Camera,
  Video,
  Image,
  Music,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart,
  LineChart,
  Target,
  Award,
  Trophy,
  Layout,
  Grid,
  List,
  Table,
  Columns,
  Square,
  Circle,
  Loader2,
} from "lucide-react"

const iconMap = {
  // Navigation
  search: Search,
  plus: Plus,
  x: X,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  back: ArrowLeft,
  forward: ArrowRight,
  up: ArrowUp,
  down: ArrowDown,
  home: Home,

  // Actions
  edit: Edit,
  delete: Trash2,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  settings: Settings,
  copy: Copy,
  share: Share,
  external: ExternalLink,

  // Users
  users: Users,
  userPlus: UserPlus,
  userMinus: UserMinus,
  userCheck: UserCheck,
  userX: UserX,

  // Data & Analytics
  analytics: BarChart3,
  barChart: BarChart,
  lineChart: LineChart,
  pieChart: PieChart,
  activity: Activity,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  target: Target,

  // Time & Calendar
  calendar: Calendar,
  clock: Clock,

  // Files & Documents
  documents: FileText,
  file: File,
  fileText: FileText,
  fileImage: FileImage,
  fileVideo: FileVideo,
  fileAudio: FileAudio,
  fileSpreadsheet: FileText, // Using FileText as placeholder
  filePdf: FileText, // Using FileText as placeholder
  folder: Folder,
  folderOpen: FolderOpen,

  // Communication
  messages: MessageSquare,
  mail: Mail,
  phone: Phone,
  links: Link,

  // Status & Alerts
  alertTriangle: AlertTriangle,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  bell: Bell,
  bellOff: BellOff,

  // Visibility
  eye: Eye,
  eyeOff: EyeOff,

  // Location & Network
  mapPin: MapPin,
  globe: Globe,
  wifi: Wifi,
  wifiOff: WifiOff,
  server: Server,
  database: Database,
  cloud: Cloud,

  // Security
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  key: Key,

  // UI Elements
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,
  maximize: Maximize,
  minimize: Minimize,
  layout: Layout,
  grid: Grid,
  list: List,
  table: Table,
  columns: Columns,

  // Theme
  sun: Sun,
  moon: Moon,
  monitor: Monitor,

  // Devices
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  desktop: Desktop,

  // Media
  play: Play,
  pause: Pause,
  stop: Stop,
  volume: Volume,
  volumeX: VolumeX,
  camera: Camera,
  video: Video,
  image: Image,
  music: Music,

  // Commerce
  shoppingCart: ShoppingCart,
  creditCard: CreditCard,
  dollarSign: DollarSign,

  // Achievements
  award: Award,
  trophy: Trophy,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,

  // Shapes
  square: Square,
  circle: Circle,

  // Loading
  loader: Loader2,

  // Code
  code: FileText, // Using FileText as placeholder
} as const

type IconName = keyof typeof iconMap

interface AdminIconProps {
  name: IconName
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "muted" | "white" | "black"
  className?: string
  style?: React.CSSProperties
}

export function AdminIcon({ name, size = "md", color, className = "", style }: AdminIconProps) {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return <div className={`inline-block ${className}`} style={style} />
  }

  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  }

  const colorClasses = {
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-purple-600 dark:text-purple-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-sky-600 dark:text-sky-400",
    muted: "text-gray-500 dark:text-gray-400",
    white: "text-white",
    black: "text-black dark:text-white",
  }

  const classes = [sizeClasses[size], color ? colorClasses[color] : "", className].filter(Boolean).join(" ")

  return <IconComponent className={classes} style={style} />
}

// Export icon names for TypeScript autocomplete
export type { IconName }
