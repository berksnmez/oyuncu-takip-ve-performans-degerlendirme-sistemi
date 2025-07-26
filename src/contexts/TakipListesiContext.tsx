"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define types for our context
interface TakipListesiItem {
  id: number;
  blabla?: string; // Add blabla field for kaleci items
  oyuncu_id?: number | string; // Add oyuncu_id field for stoper items
  blabla_stp?: string; // Add blabla_stp field for stoper items
  blabla_bek?: string; // Add blabla_bek field for bek items
  blabla_dos?: string; // Add blabla_dos field for dos items
  blabla_os?: string; // Add blabla_os field for orta-saha items
  blabla_oos?: string; // Add blabla_oos field for ofansif orta saha items
  blabla_knt?: string; // Add blabla_knt field for kanat items
  blabla_acknt?: string; // Add blabla_acknt field for acik-kanat items
  blabla_snt?: string; // Add blabla_snt field for santrafor items
  [key: string]: any;
}

// Define a result type for add operations
interface AddResult {
  success: boolean;
  isDuplicate: boolean;
}

interface TakipListesiContextType {
  takipListesi: TakipListesiItem[];
  addToTakipListesi: (item: TakipListesiItem, category: string) => AddResult;
  removeFromTakipListesi: (identifier: number | string, category: string) => void;
  isInTakipListesi: (identifier: number | string, category: string) => boolean;
  getItemsByCategory: (category: string) => TakipListesiItem[];
  resetTakipListesi: () => void;
}

// Create the context
const TakipListesiContext = createContext<TakipListesiContextType | undefined>(undefined);

// Provider component
export const TakipListesiProvider = ({ children }: { children: ReactNode }) => {
  // Group items by categories (kaleci, stoper, etc.)
  const [categorizedItems, setCategorizedItems] = useState<{ [category: string]: TakipListesiItem[] }>({});

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedTakipListesi = localStorage.getItem('takipListesi');
    if (savedTakipListesi) {
      try {
        const parsedData = JSON.parse(savedTakipListesi);
        console.log("Loaded from localStorage:", parsedData);
        setCategorizedItems(parsedData);
      } catch (e) {
        console.error('Error parsing saved takip listesi:', e);
        setCategorizedItems({});
      }
    }
  }, []);

  // Save to localStorage whenever the list changes
  useEffect(() => {
    console.log("Saving to localStorage:", categorizedItems);
    localStorage.setItem('takipListesi', JSON.stringify(categorizedItems));
  }, [categorizedItems]);

  // Reset the watch list (for debugging)
  const resetTakipListesi = () => {
    setCategorizedItems({});
    localStorage.removeItem('takipListesi');
    console.log('Takip listesi has been reset');
  };

  // Flatten all categories into one array
  const takipListesi = Object.values(categorizedItems).flat();

  // Helper to check for duplicates based on category
  const isDuplicate = (item: TakipListesiItem, categoryItems: TakipListesiItem[], category: string): boolean => {
    if (category === 'kaleci' && item.blabla) {
      // For kaleci, use blabla field for duplicate check
      const targetBlabla = String(item.blabla).trim();
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla) return false;
        
        const existingBlabla = String(existingItem.blabla).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check: "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'stoper' && item.blabla_stp) {
      // For stoper, use blabla_stp field for duplicate check
      const targetBlabla = String(item.blabla_stp).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking stoper (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_stp) {
            console.log(`Item #${index}: blabla_stp="${String(existingItem.blabla_stp).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_stp field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_stp) return false;
        
        const existingBlabla = String(existingItem.blabla_stp).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (stoper): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'bek' && item.blabla_bek) {
      // For bek, use blabla_bek field for duplicate check
      const targetBlabla = String(item.blabla_bek).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking bek (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_bek) {
            console.log(`Item #${index}: blabla_bek="${String(existingItem.blabla_bek).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_bek field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_bek) return false;
        
        const existingBlabla = String(existingItem.blabla_bek).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (bek): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'dos' && item.blabla_dos) {
      // For dos, use blabla_dos field for duplicate check
      const targetBlabla = String(item.blabla_dos).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking dos (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_dos) {
            console.log(`Item #${index}: blabla_dos="${String(existingItem.blabla_dos).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_dos field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_dos) return false;
        
        const existingBlabla = String(existingItem.blabla_dos).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (dos): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'orta-saha' && item.blabla_os) {
      // For orta-saha, use blabla_os field for duplicate check
      const targetBlabla = String(item.blabla_os).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking orta-saha (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_os) {
            console.log(`Item #${index}: blabla_os="${String(existingItem.blabla_os).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_os field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_os) return false;
        
        const existingBlabla = String(existingItem.blabla_os).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (orta-saha): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'oos' && item.blabla_oos) {
      // For oos, use blabla_oos field for duplicate check
      const targetBlabla = String(item.blabla_oos).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking oos (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_oos) {
            console.log(`Item #${index}: blabla_oos="${String(existingItem.blabla_oos).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_oos field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_oos) return false;
        
        const existingBlabla = String(existingItem.blabla_oos).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (oos): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'kanat' && item.blabla_knt) {
      // For kanat, use blabla_knt field for duplicate check
      const targetBlabla = String(item.blabla_knt).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking kanat (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_knt) {
            console.log(`Item #${index}: blabla_knt="${String(existingItem.blabla_knt).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_knt field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_knt) return false;
        
        const existingBlabla = String(existingItem.blabla_knt).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (kanat): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'acik-kanat' && item.blabla_acknt) {
      // For acik-kanat, use blabla_acknt field for duplicate check
      const targetBlabla = String(item.blabla_acknt).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking acik-kanat (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_acknt) {
            console.log(`Item #${index}: blabla_acknt="${String(existingItem.blabla_acknt).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_acknt field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_acknt) return false;
        
        const existingBlabla = String(existingItem.blabla_acknt).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (acik-kanat): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else if (category === 'santrafor' && item.blabla_snt) {
      // For santrafor, use blabla_snt field for duplicate check
      const targetBlabla = String(item.blabla_snt).trim();
      
      // Debug için mevcut öğeleri göster
      if (categoryItems.length > 0) {
        console.log(`Checking santrafor (${targetBlabla}) against ${categoryItems.length} existing items:`);
        categoryItems.forEach((existingItem, index) => {
          if (existingItem.blabla_snt) {
            console.log(`Item #${index}: blabla_snt="${String(existingItem.blabla_snt).trim()}"`);
          } else {
            console.log(`Item #${index}: has no blabla_snt field`);
          }
        });
      }
      
      return categoryItems.some(existingItem => {
        if (!existingItem.blabla_snt) return false;
        
        const existingBlabla = String(existingItem.blabla_snt).trim();
        const isDup = existingBlabla === targetBlabla;
        
        console.log(`Duplicate check (santrafor): "${existingBlabla}" === "${targetBlabla}"? ${isDup}`);
        return isDup;
      });
    } else {
      // For other categories, use id for duplicate check
      return categoryItems.some(existingItem => Number(existingItem.id) === Number(item.id));
    }
  };

  // Add item to the watched list with duplicate prevention
  const addToTakipListesi = (item: TakipListesiItem, category: string): AddResult => {
    console.log(`Adding item to ${category}:`, item);
    
    // Create result object
    const result: AddResult = {
      success: false,
      isDuplicate: false
    };

    setCategorizedItems(prev => {
      const categoryItems = prev[category] || [];
      console.log(`Current items in ${category}:`, categoryItems);
      
      // Check if item already exists using category-specific logic
      const duplicate = isDuplicate(item, categoryItems, category);
      console.log(`Duplicate check result for ${category}: ${duplicate}`);
      
      if (duplicate) {
        // Mark as duplicate and return unchanged state
        result.isDuplicate = true;
        console.log(`Item is a duplicate in ${category}, not adding`);
        return prev;
      }
      
      // Create a clean object to store
      const cleanItem = {
        ...item,
        id: Number(item.id)
      };
      
      // Make sure blabla is properly set for kaleci
      if (category === 'kaleci' && item.blabla) {
        console.log(`Storing kaleci with blabla: ${item.blabla} (${typeof item.blabla})`);
        // Ensure blabla is a string
        cleanItem.blabla = String(item.blabla).trim();
      }
      
      // Make sure blabla_stp is properly set for stoper
      if (category === 'stoper' && item.blabla_stp) {
        console.log(`Storing stoper with blabla_stp: ${item.blabla_stp} (${typeof item.blabla_stp})`);
        // Store blabla_stp as string for consistent comparison
        cleanItem.blabla_stp = String(item.blabla_stp).trim();
      } else if (category === 'stoper' && !item.blabla_stp) {
        // Eğer blabla_stp yoksa ve stoper kategorisinde ekliyorsak, id'yi blabla_stp olarak kullan
        console.log(`No blabla_stp found for stoper, using id: ${item.id} as blabla_stp`);
        cleanItem.blabla_stp = String(item.id).trim();
      }
      
      // Make sure blabla_bek is properly set for bek
      if (category === 'bek' && item.blabla_bek) {
        console.log(`Storing bek with blabla_bek: ${item.blabla_bek} (${typeof item.blabla_bek})`);
        // Store blabla_bek as string for consistent comparison
        cleanItem.blabla_bek = String(item.blabla_bek).trim();
      } else if (category === 'bek' && !item.blabla_bek) {
        // Eğer blabla_bek yoksa ve bek kategorisinde ekliyorsak, id'yi blabla_bek olarak kullan
        console.log(`No blabla_bek found for bek, using id: ${item.id} as blabla_bek`);
        cleanItem.blabla_bek = String(item.id).trim();
      }
      
      // Make sure blabla_dos is properly set for dos
      if (category === 'dos' && item.blabla_dos) {
        console.log(`Storing dos with blabla_dos: ${item.blabla_dos} (${typeof item.blabla_dos})`);
        // Store blabla_dos as string for consistent comparison
        cleanItem.blabla_dos = String(item.blabla_dos).trim();
      } else if (category === 'dos' && !item.blabla_dos) {
        // Eğer blabla_dos yoksa ve dos kategorisinde ekliyorsak, id'yi blabla_dos olarak kullan
        console.log(`No blabla_dos found for dos, using id: ${item.id} as blabla_dos`);
        cleanItem.blabla_dos = String(item.id).trim();
      }
      
      // Make sure blabla_os is properly set for orta-saha
      if (category === 'orta-saha' && item.blabla_os) {
        console.log(`Storing orta-saha with blabla_os: ${item.blabla_os} (${typeof item.blabla_os})`);
        // Store blabla_os as string for consistent comparison
        cleanItem.blabla_os = String(item.blabla_os).trim();
      } else if (category === 'orta-saha' && !item.blabla_os) {
        // Eğer blabla_os yoksa ve orta-saha kategorisinde ekliyorsak, id'yi blabla_os olarak kullan
        console.log(`No blabla_os found for orta-saha, using id: ${item.id} as blabla_os`);
        cleanItem.blabla_os = String(item.id).trim();
      }
      
      // Make sure blabla_oos is properly set for oos
      if (category === 'oos' && item.blabla_oos) {
        console.log(`Storing oos with blabla_oos: ${item.blabla_oos} (${typeof item.blabla_oos})`);
        // Store blabla_oos as string for consistent comparison
        cleanItem.blabla_oos = String(item.blabla_oos).trim();
      } else if (category === 'oos' && !item.blabla_oos) {
        // Eğer blabla_oos yoksa ve oos kategorisinde ekliyorsak, id'yi blabla_oos olarak kullan
        console.log(`No blabla_oos found for oos, using id: ${item.id} as blabla_oos`);
        cleanItem.blabla_oos = String(item.id).trim();
      }
      
      // Make sure blabla_knt is properly set for kanat
      if (category === 'kanat' && item.blabla_knt) {
        console.log(`Storing kanat with blabla_knt: ${item.blabla_knt} (${typeof item.blabla_knt})`);
        // Store blabla_knt as string for consistent comparison
        cleanItem.blabla_knt = String(item.blabla_knt).trim();
      } else if (category === 'kanat' && !item.blabla_knt) {
        // Eğer blabla_knt yoksa ve kanat kategorisinde ekliyorsak, id'yi blabla_knt olarak kullan
        console.log(`No blabla_knt found for kanat, using id: ${item.id} as blabla_knt`);
        cleanItem.blabla_knt = String(item.id).trim();
      }
      
      // Make sure blabla_acknt is properly set for acik-kanat
      if (category === 'acik-kanat' && item.blabla_acknt) {
        console.log(`Storing acik-kanat with blabla_acknt: ${item.blabla_acknt} (${typeof item.blabla_acknt})`);
        // Store blabla_acknt as string for consistent comparison
        cleanItem.blabla_acknt = String(item.blabla_acknt).trim();
      } else if (category === 'acik-kanat' && !item.blabla_acknt) {
        // Eğer blabla_acknt yoksa ve acik-kanat kategorisinde ekliyorsak, id'yi blabla_acknt olarak kullan
        console.log(`No blabla_acknt found for acik-kanat, using id: ${item.id} as blabla_acknt`);
        cleanItem.blabla_acknt = String(item.id).trim();
      }
      
      // Make sure blabla_snt is properly set for santrafor
      if (category === 'santrafor' && item.blabla_snt) {
        console.log(`Storing santrafor with blabla_snt: ${item.blabla_snt} (${typeof item.blabla_snt})`);
        // Store blabla_snt as string for consistent comparison
        cleanItem.blabla_snt = String(item.blabla_snt).trim();
      } else if (category === 'santrafor' && !item.blabla_snt) {
        // Eğer blabla_snt yoksa ve santrafor kategorisinde ekliyorsak, id'yi blabla_snt olarak kullan
        console.log(`No blabla_snt found for santrafor, using id: ${item.id} as blabla_snt`);
        cleanItem.blabla_snt = String(item.id).trim();
      }
      
      // Mark as success
      result.success = true;
      
      // Add item to the category
      const newState = {
        ...prev,
        [category]: [...categoryItems, cleanItem]
      };
      
      console.log(`After adding item to ${category}:`, newState[category]);
      return newState;
    });
    
    return result;
  };

  // Remove item from the watched list
  const removeFromTakipListesi = (identifier: number | string, category: string) => {
    console.log(`Removing item with identifier ${identifier} (type: ${typeof identifier}) from category ${category}`);
    
    try {
      // Normalize identifier for consistent comparison
      const normalizedIdentifier = typeof identifier === 'string' ? String(identifier).trim() : String(identifier);
      console.log(`Normalized identifier for removal: "${normalizedIdentifier}"`);
      
      // Get the current state first
      const currentCategorizedItems = {...categorizedItems};
      const categoryItems = [...(currentCategorizedItems[category] || [])];
      
      // Nothing to remove if category doesn't exist or is empty
      if (!categoryItems.length) {
        console.log(`No items found in category ${category}`);
        return;
      }
      
      // Filter based on category-specific logic
      let updatedCategoryItems;
      if (category === 'kaleci' && typeof identifier === 'string') {
        // For kaleci, filter based on blabla
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla) return true; // Keep items without blabla
          
          const itemBlabla = String(item.blabla).trim();
          const targetBlabla = normalizedIdentifier;
          
          const result = itemBlabla !== targetBlabla;
          console.log(`Comparing item blabla: "${itemBlabla}" with identifier: "${targetBlabla}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'stoper') {
        // For stoper, filter based on blabla_stp
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_stp) return true; // Keep items without blabla_stp
          
          const itemBlabla = String(item.blabla_stp).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing stoper blabla_stp: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'bek') {
        // For bek, filter based on blabla_bek
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_bek) return true; // Keep items without blabla_bek
          
          const itemBlabla = String(item.blabla_bek).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing bek blabla_bek: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'dos') {
        // For dos, filter based on blabla_dos
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_dos) return true; // Keep items without blabla_dos
          
          const itemBlabla = String(item.blabla_dos).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing dos blabla_dos: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'orta-saha') {
        // For orta-saha, filter based on blabla_os
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_os) return true; // Keep items without blabla_os
          
          const itemBlabla = String(item.blabla_os).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing orta-saha blabla_os: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'oos') {
        // For oos, filter based on blabla_oos
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_oos) return true; // Keep items without blabla_oos
          
          const itemBlabla = String(item.blabla_oos).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing oos blabla_oos: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'kanat') {
        // For kanat, filter based on blabla_knt
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_knt) return true; // Keep items without blabla_knt
          
          const itemBlabla = String(item.blabla_knt).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing kanat blabla_knt: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'acik-kanat') {
        // For acik-kanat, filter based on blabla_acknt
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_acknt) return true; // Keep items without blabla_acknt
          
          const itemBlabla = String(item.blabla_acknt).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing acik-kanat blabla_acknt: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else if (category === 'santrafor') {
        // For santrafor, filter based on blabla_snt
        updatedCategoryItems = categoryItems.filter(item => {
          // Null check and type conversion for safer comparison
          if (!item.blabla_snt) return true; // Keep items without blabla_snt
          
          const itemBlabla = String(item.blabla_snt).trim();
          
          const result = itemBlabla !== normalizedIdentifier;
          console.log(`Comparing santrafor blabla_snt: "${itemBlabla}" with identifier: "${normalizedIdentifier}" - keep item? ${result}`);
          return result;
        });
      } else {
        // For other categories, filter based on id
        updatedCategoryItems = categoryItems.filter(item => String(item.id).trim() !== normalizedIdentifier);
      }
      
      // If no items were removed, do nothing
      if (categoryItems.length === updatedCategoryItems.length) {
        console.log(`Item with identifier ${normalizedIdentifier} not found in ${category}`);
        return;
      }
      
      // Create new state with updated category
      const newCategorizedItems = {
        ...currentCategorizedItems,
        [category]: updatedCategoryItems
      };
      
      // Update localStorage first
      try {
        localStorage.setItem('takipListesi', JSON.stringify(newCategorizedItems));
        console.log("localStorage updated successfully");
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }
      
      // Then update state
      setCategorizedItems(newCategorizedItems);
      console.log(`After removal: ${updatedCategoryItems.length} items in ${category}`);
    } catch (error) {
      console.error("Error in removeFromTakipListesi:", error);
    }
  };

  // Check if an item is in the watched list
  const isInTakipListesi = (identifier: number | string, category: string) => {
    const categoryItems = categorizedItems[category] || [];
    console.log(`Checking if item ${identifier} (${typeof identifier}) is in ${category}, found ${categoryItems.length} items`);
    
    // Normalize identifier for consistent comparison
    const normalizedIdentifier = typeof identifier === 'string' ? String(identifier).trim() : String(identifier);
    console.log(`Normalized identifier: "${normalizedIdentifier}"`);
    
    // Use category-specific logic to check if item exists
    if (category === 'kaleci' && typeof identifier === 'string') {
      // For kaleci, check using blabla
      const found = categoryItems.some(item => {
        // Skip items without blabla
        if (!item.blabla) return false;
        
        const itemBlabla = String(item.blabla).trim();
        const targetBlabla = String(identifier).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing item blabla: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla: ${found}`);
      return found;
    } else if (category === 'stoper') {
      // For stoper, check using blabla_stp
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm stoper öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_stp) {
          console.log(`Stoper item #${index}, blabla_stp: "${String(item.blabla_stp).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`Stoper item #${index} has no blabla_stp field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_stp
        if (!item.blabla_stp) return false;
        
        const itemBlabla = String(item.blabla_stp).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing stoper blabla_stp: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_stp: ${found}`);
      return found;
    } else if (category === 'bek') {
      // For bek, check using blabla_bek
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm bek öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_bek) {
          console.log(`Bek item #${index}, blabla_bek: "${String(item.blabla_bek).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`Bek item #${index} has no blabla_bek field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_bek
        if (!item.blabla_bek) return false;
        
        const itemBlabla = String(item.blabla_bek).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing bek blabla_bek: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_bek: ${found}`);
      return found;
    } else if (category === 'dos') {
      // For dos, check using blabla_dos
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm dos öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_dos) {
          console.log(`DOS item #${index}, blabla_dos: "${String(item.blabla_dos).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`DOS item #${index} has no blabla_dos field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_dos
        if (!item.blabla_dos) return false;
        
        const itemBlabla = String(item.blabla_dos).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing dos blabla_dos: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_dos: ${found}`);
      return found;
    } else if (category === 'orta-saha') {
      // For orta-saha, check using blabla_os
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm orta-saha öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_os) {
          console.log(`Orta Saha item #${index}, blabla_os: "${String(item.blabla_os).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`Orta Saha item #${index} has no blabla_os field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_os
        if (!item.blabla_os) return false;
        
        const itemBlabla = String(item.blabla_os).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing orta-saha blabla_os: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_os: ${found}`);
      return found;
    } else if (category === 'oos') {
      // For oos, check using blabla_oos
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm oos öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_oos) {
          console.log(`OOS item #${index}, blabla_oos: "${String(item.blabla_oos).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`OOS item #${index} has no blabla_oos field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_oos
        if (!item.blabla_oos) return false;
        
        const itemBlabla = String(item.blabla_oos).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing oos blabla_oos: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_oos: ${found}`);
      return found;
    } else if (category === 'kanat') {
      // For kanat, check using blabla_knt
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm kanat öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_knt) {
          console.log(`Kanat item #${index}, blabla_knt: "${String(item.blabla_knt).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`Kanat item #${index} has no blabla_knt field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_knt
        if (!item.blabla_knt) return false;
        
        const itemBlabla = String(item.blabla_knt).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing kanat blabla_knt: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_knt: ${found}`);
      return found;
    } else if (category === 'acik-kanat') {
      // For acik-kanat, check using blabla_acknt
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm acik-kanat öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_acknt) {
          console.log(`Acik Kanat item #${index}, blabla_acknt: "${String(item.blabla_acknt).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`Acik Kanat item #${index} has no blabla_acknt field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_acknt
        if (!item.blabla_acknt) return false;
        
        const itemBlabla = String(item.blabla_acknt).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing acik-kanat blabla_acknt: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_acknt: ${found}`);
      return found;
    } else if (category === 'santrafor') {
      // For santrafor, check using blabla_snt
      const targetBlabla = normalizedIdentifier;
      
      // Debug için tüm santrafor öğelerini incele
      categoryItems.forEach((item, index) => {
        if (item.blabla_snt) {
          console.log(`Santrafor item #${index}, blabla_snt: "${String(item.blabla_snt).trim()}", target: "${targetBlabla}"`);
        } else {
          console.log(`Santrafor item #${index} has no blabla_snt field`);
        }
      });
      
      const found = categoryItems.some(item => {
        // Skip items without blabla_snt
        if (!item.blabla_snt) return false;
        
        const itemBlabla = String(item.blabla_snt).trim();
        
        const match = itemBlabla === targetBlabla;
        console.log(`Comparing santrafor blabla_snt: "${itemBlabla}" with identifier: "${targetBlabla}" - match? ${match}`);
        return match;
      });
      console.log(`Found by blabla_snt: ${found}`);
      return found;
    } else {
      // For other categories, check using id
      const found = categoryItems.some(item => String(item.id).trim() === normalizedIdentifier);
      console.log(`Found by ID: ${found}`);
      return found;
    }
  };

  // Get items by category
  const getItemsByCategory = (category: string) => {
    return categorizedItems[category] || [];
  };

  return (
    <TakipListesiContext.Provider value={{ 
      takipListesi, 
      addToTakipListesi, 
      removeFromTakipListesi, 
      isInTakipListesi, 
      getItemsByCategory,
      resetTakipListesi
    }}>
      {children}
    </TakipListesiContext.Provider>
  );
};

// Custom hook to use the context
export const useTakipListesi = () => {
  const context = useContext(TakipListesiContext);
  if (context === undefined) {
    throw new Error('useTakipListesi must be used within a TakipListesiProvider');
  }
  return context;
}; 