import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronLeft, Check, X, MapPin } from 'lucide-react';
import { Language } from '../types';
import { LEBANON_REGIONS } from '../data/properties';

interface LocationCascadeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  lang: Language;
}

export const LocationCascadeDropdown: React.FC<LocationCascadeDropdownProps> = ({
  value,
  onChange,
  lang,
}) => {
  const isArabic = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse comma-separated value into array of selected names
  const selectedList = useMemo(() => {
    if (!value || value === 'All Lebanon' || value === 'كافة المناطق اللبنانية') return [];
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  // Active region in left column (defaults to 'beirut' or 'lebanon')
  const [activeRegionId, setActiveRegionId] = useState<string>('beirut');
  // Expanded districts/zones to show sub-areas (e.g. Achrafieh, Al Mazraa, Al Mseitbeh, Ras Beirut)
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({
    achrafieh_central: true,
    al_mazraa_surroundings: true,
    al_mseitbeh_surroundings: true,
    ras_beirut_surroundings: true,
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeRegion = useMemo(() => {
    return LEBANON_REGIONS.find((r) => r.id === activeRegionId) || LEBANON_REGIONS[0];
  }, [activeRegionId]);

  // Check if a specific location name is selected
  const isSelected = (nameEn: string, nameAr: string) => {
    const cleanEn = nameEn.split('(')[0].trim().toLowerCase();
    const lowerEn = nameEn.toLowerCase();
    const cleanAr = nameAr.split('(')[0].trim();
    return selectedList.some((s) => {
      const low = s.toLowerCase();
      return (
        low === lowerEn ||
        low === cleanEn ||
        low === nameAr.toLowerCase() ||
        s === cleanAr ||
        s === nameAr
      );
    });
  };

  // Toggle selection
  const toggleLocation = (nameEn: string, nameAr: string) => {
    const displayName = isArabic ? nameAr.split('(')[0].trim() : nameEn.split('(')[0].trim();
    let updated: string[];

    if (isSelected(nameEn, nameAr)) {
      const cleanEn = nameEn.split('(')[0].trim().toLowerCase();
      const lowerEn = nameEn.toLowerCase();
      const cleanAr = nameAr.split('(')[0].trim();
      updated = selectedList.filter((s) => {
        const low = s.toLowerCase();
        return (
          low !== lowerEn &&
          low !== cleanEn &&
          low !== nameAr.toLowerCase() &&
          s !== cleanAr &&
          s !== nameAr
        );
      });
    } else {
      updated = [...selectedList, displayName];
    }

    onChange(updated.join(', '));
  };

  const toggleExpandDistrict = (districtId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDistricts((prev) => ({
      ...prev,
      [districtId]: !prev[districtId],
    }));
  };

  const handleClear = () => {
    onChange('');
    setSearchQuery('');
  };

  // Flat list for search filtering
  const allLocationsFlat = useMemo(() => {
    const list: {
      id: string;
      nameEn: string;
      nameAr: string;
      parentEn: string;
      parentAr: string;
      count?: number;
    }[] = [];

    LEBANON_REGIONS.forEach((reg) => {
      reg.neighborhoods.forEach((dist) => {
        list.push({
          id: `${reg.id}-${dist.id}`,
          nameEn: dist.nameEn,
          nameAr: dist.nameAr,
          parentEn: reg.nameEn,
          parentAr: reg.nameAr,
          count: dist.count,
        });
        if (dist.subAreas) {
          dist.subAreas.forEach((sub) => {
            list.push({
              id: `${dist.id}-${sub.id}`,
              nameEn: sub.nameEn,
              nameAr: sub.nameAr,
              parentEn: `${dist.nameEn}, ${reg.nameEn}`,
              parentAr: `${dist.nameAr}، ${reg.nameAr}`,
              count: sub.count,
            });
          });
        }
      });
    });
    return list;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allLocationsFlat.filter(
      (item) =>
        item.nameEn.toLowerCase().includes(q) ||
        item.nameAr.includes(searchQuery.trim()) ||
        item.parentEn.toLowerCase().includes(q)
    );
  }, [allLocationsFlat, searchQuery]);

  const displayLabel = useMemo(() => {
    if (selectedList.length === 0) return '';
    if (selectedList.length === 1) return selectedList[0];
    if (selectedList.length === 2) return `${selectedList[0]}, ${selectedList[1]}`;
    return `${selectedList[0]}, ${selectedList[1]} (+${selectedList.length - 2})`;
  }, [selectedList]);

  return (
    <div
      ref={containerRef}
      className="relative w-full text-left z-40"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Interactive Location Input Box */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className="relative flex items-center w-full h-10 px-3 bg-black/25 hover:bg-black/35 focus-within:bg-black/45 border border-white/50 focus-within:border-white rounded-lg transition-all cursor-pointer shadow-sm"
      >
        <MapPin className="w-3.5 h-3.5 text-[#c4191a] shrink-0 mr-2 rtl:mr-0 rtl:ml-2" />

        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayLabel}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={
            selectedList.length > 0
              ? displayLabel
              : isArabic
              ? 'الموقع (اختر المنطقة أو الحي)'
              : 'Location'
          }
          className="w-full bg-transparent text-white placeholder-white/80 text-xs sm:text-sm font-normal focus:outline-none cursor-pointer truncate pr-14 rtl:pr-0 rtl:pl-14"
        />

        {/* Clear selection & Chevron Down indicator */}
        <div className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {selectedList.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition p-0.5"
              title={isArabic ? 'مسح الاختيار' : 'Clear selection'}
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}

          {selectedList.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#c4191a] text-white text-[9px] font-bold flex items-center justify-center">
              {selectedList.length}
            </span>
          )}

          <ChevronDown
            className={`w-4 h-4 text-white/90 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Cascading Multi-Column Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-1.5 z-50 w-full sm:w-[540px] md:w-[600px] max-w-[calc(100vw-24px)] bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-200 overflow-hidden text-xs animate-in fade-in slide-in-from-top-1 duration-150"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Quick Search Bar inside Dropdown */}
          <div className="p-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isArabic
                  ? 'ابحث باسم المنطقة أو الحي (مثال: كورنيش المزرعة، مار الياس، الحمرا، فردان...)'
                  : 'Search location (e.g. Corniche Al Mazraa, Mar Elias, Hamra...)'
              }
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* If searching: Show Search Results */}
          {searchQuery.trim().length > 0 ? (
            <div className="p-3 max-h-[300px] overflow-y-auto">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {isArabic ? 'نتائج البحث' : 'Matching Locations'} ({searchResults.length})
              </div>

              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  {isArabic ? 'لا توجد نتائج مطابقة' : 'No matching locations found'}
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((loc) => {
                    const checked = isSelected(loc.nameEn, loc.nameAr);
                    return (
                      <label
                        key={loc.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          checked ? 'bg-red-50 text-[#c4191a]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLocation(loc.nameEn, loc.nameAr)}
                            className="w-4 h-4 accent-[#c4191a] rounded cursor-pointer"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-xs text-gray-900 block truncate">
                              {isArabic ? loc.nameAr : loc.nameEn}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block">
                              {isArabic ? loc.parentAr : loc.parentEn}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {loc.count !== undefined && (
                            <span className="text-[10px] text-gray-400">({loc.count})</span>
                          )}
                          {checked && <Check className="w-3.5 h-3.5 text-[#c4191a]" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* 2-Column Cascading View (Matching Reference) */
            <div className="flex h-[320px]">
              {/* Column 1: Regions / Governorates (Left Column: ~38% width) */}
              <div className="w-5/12 bg-gray-50/90 border-r rtl:border-r-0 rtl:border-l border-gray-200 overflow-y-auto p-1.5 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  {isArabic ? 'المناطق الرئيسية' : 'Main Regions'}
                </div>

                {LEBANON_REGIONS.map((region) => {
                  const isActive = activeRegionId === region.id;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => setActiveRegionId(region.id)}
                      className={`w-full text-start px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        isActive
                          ? 'bg-[#c4191a] text-white shadow-xs'
                          : 'text-gray-700 hover:bg-gray-200/70'
                      }`}
                    >
                      <span className="truncate">{isArabic ? region.nameAr : region.nameEn}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {region.count !== undefined && (
                          <span
                            className={`text-[10px] ${
                              isActive ? 'text-white/80' : 'text-gray-400'
                            }`}
                          >
                            ({region.count})
                          </span>
                        )}
                        {isArabic ? (
                          <ChevronLeft
                            className={`w-3.5 h-3.5 ${
                              isActive ? 'text-white' : 'text-gray-400'
                            }`}
                          />
                        ) : (
                          <ChevronRight
                            className={`w-3.5 h-3.5 ${
                              isActive ? 'text-white' : 'text-gray-400'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Column 2: Specific Districts / Neighborhoods (Right Column: ~62% width) */}
              <div className="w-7/12 p-2.5 overflow-y-auto space-y-1 bg-white">
                <div className="px-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center justify-between pb-1 border-b border-gray-100 mb-1">
                  <span>
                    {isArabic ? activeRegion.nameAr : activeRegion.nameEn}
                  </span>
                  <span>({activeRegion.neighborhoods.length})</span>
                </div>

                {activeRegion.neighborhoods.map((district) => {
                  const checked = isSelected(district.nameEn, district.nameAr);
                  const hasSubAreas = district.subAreas && district.subAreas.length > 0;
                  const isExpanded = !!expandedDistricts[district.id];

                  return (
                    <div key={district.id} className="space-y-0.5">
                      <div
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                          checked
                            ? 'bg-red-50 text-[#c4191a] font-semibold'
                            : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <label className="flex items-center gap-2 truncate flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLocation(district.nameEn, district.nameAr)}
                            className="w-3.5 h-3.5 accent-[#c4191a] rounded cursor-pointer shrink-0"
                          />
                          <span className="truncate text-xs font-medium">
                            {isArabic ? district.nameAr : district.nameEn}
                          </span>
                        </label>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {district.count !== undefined && (
                            <span className="text-[10px] text-gray-400">
                              ({district.count})
                            </span>
                          )}

                          {hasSubAreas && (
                            <button
                              type="button"
                              onClick={(e) => toggleExpandDistrict(district.id, e)}
                              className="p-1 hover:bg-gray-200/60 rounded text-gray-500 cursor-pointer"
                              title={isArabic ? 'عرض الأحياء التفصيلية' : 'View sub-areas'}
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-gray-600 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}

                          {checked && !hasSubAreas && (
                            <Check className="w-3 h-3 text-[#c4191a]" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Sub-areas with checkboxes */}
                      {hasSubAreas && isExpanded && (
                        <div className="pl-5 rtl:pl-0 rtl:pr-5 space-y-0.5 py-1 border-l-2 rtl:border-l-0 rtl:border-r-2 border-red-300 ml-2 rtl:ml-0 rtl:mr-2 bg-gray-50/50 rounded-r-md rtl:rounded-r-none rtl:rounded-l-md">
                          {district.subAreas!.map((sub) => {
                            const subChecked = isSelected(sub.nameEn, sub.nameAr);
                            return (
                              <label
                                key={sub.id}
                                className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] cursor-pointer transition ${
                                  subChecked
                                    ? 'bg-red-100 text-[#c4191a] font-bold'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <input
                                    type="checkbox"
                                    checked={subChecked}
                                    onChange={() => toggleLocation(sub.nameEn, sub.nameAr)}
                                    className="w-3 h-3 accent-[#c4191a] rounded cursor-pointer shrink-0"
                                  />
                                  <span className="truncate">
                                    {isArabic ? sub.nameAr : sub.nameEn}
                                  </span>
                                </div>
                                {sub.count !== undefined && (
                                  <span className="text-[9px] text-gray-400">
                                    ({sub.count})
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Bar: Selected count, Clear, and Apply CTA button */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div>
              {selectedList.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] font-semibold text-gray-500 hover:text-red-600 transition cursor-pointer"
                >
                  {isArabic ? 'مسح الاختيارات' : 'Clear all'} ({selectedList.length})
                </button>
              ) : (
                <span className="text-[11px] text-gray-400">
                  {isArabic ? 'اختر منطقة واحدة أو أكثر' : 'Select one or more areas'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-[#c4191a] hover:bg-[#a51516] text-white text-xs font-bold transition shadow-xs cursor-pointer select-none"
            >
              {isArabic ? 'تأكيد الاختيار' : 'Apply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
