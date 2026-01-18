import { ExternalLink, FileText, Navigation, ShoppingCart, Info, MessageCircle } from "lucide-react";

export function WebsiteAnalysis({ data, onNavigate }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case "navigation":
        return <Navigation className="w-4 h-4" />;
      case "shop":
        return <ShoppingCart className="w-4 h-4" />;
      case "info":
        return <Info className="w-4 h-4" />;
      case "contact":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 mb-4">
      {/* Website Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 text-base sm:text-lg">{data.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{data.url}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-100">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-gray-600 px-1">Quick Navigation</p>
        <div className="grid gap-2 sm:gap-3">
          {data.sections.map((section, index) => (
            <button
              key={index}
              onClick={() => onNavigate(section.name)}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                {getIcon(section.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base text-gray-900">{section.name}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-0.5">{section.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
