// project/src/app/components/website-analysis.jsx
import { Globe, MapPin, ShoppingBag, Info, MessageCircle, Navigation } from "lucide-react";

const iconMap = {
  shop: ShoppingBag,
  info: Info,
  contact: MessageCircle,
  navigation: Navigation,
  default: Globe,
};

export function WebsiteAnalysis({ data, onNavigate }) {
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || iconMap.default;
    return IconComponent;
  };

  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg text-gray-900">{data.title}</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">{data.summary}</p>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Key Sections
        </div>
        {data.sections?.map((section, idx) => {
          const IconComponent = getIcon(section.icon);
          return (
            <button
              key={idx}
              onClick={() => onNavigate(section.name)}
              className="w-full flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors text-left group"
            >
              <div className="mt-0.5">
                <IconComponent className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 group-hover:text-blue-900">
                  {section.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {section.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
