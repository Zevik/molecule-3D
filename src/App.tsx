import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "Molecule Studio",
    "debugModeButton": "🐛 Debug Mode",
    "debugButton": "🔧 Debug",
    "moleculeInputPlaceholder": "Enter molecule name in English or Hebrew (e.g., water, מים, caffeine, קפאין)",
    "visualizeButton": "Visualize",
    "loadingButton": "Loading...",
    "suggestedMolecules": "Suggested molecules:",
    "debugModeLabel": "Debug Mode:",
    "debugModeDescription": "Enter raw molecular JSON data below",
    "debugJsonPlaceholder": "Enter molecular JSON data...",
    "renderJsonButton": "Render JSON",
    "clearButton": "Clear",
    "formulaLabel": "Formula:",
    "atomsLabel": "Atoms:",
    "bondsLabel": "Bonds:",
    "welcomeIcon": "⚛️",
    "welcomeTitle": "Enter a molecule name to begin",
    "welcomeSubtitle": "Try: water (מים), methane (מתאן), caffeine (קפאין), glucose (גלוקוז)",
    "loadingIcon": "⚛️",
    "loadingMessage": "Fetching molecular data from PubChem...",
    "controlsTitle": "Controls:",
    "dragToRotate": "• Drag to rotate",
    "scrollToZoom": "• Scroll to zoom",
    "errorFetchingMolecule": "Error fetching molecule data:",
    "invalidMolecularStructure": "Invalid molecular data structure",
    "invalidAtomStructure": "Invalid atom data structure",
    "invalidElementsStructure": "Invalid elements data structure",
    "invalidBondData": "Invalid bond data - bonds must reference valid atom IDs",
    "debugJsonError": "Debug JSON Error:",
    "translatingText": "Translating from Hebrew...",
    "moleculeNotFound": "Molecule not found in PubChem database",
    "pubchemError": "Error connecting to PubChem database",
    "compoundIdLabel": "PubChem CID:",
    "sourceLabel": "Source: PubChem Database"
  },
  "he-IL": {
    "appTitle": "סטודיו מולקולות",
    "debugModeButton": "🐛 מצב דיבאג",
    "debugButton": "🔧 דיבאג",
    "moleculeInputPlaceholder": "הכנס שם מולקולה בעברית או אנגלית (למשל: מים, water, קפאין, caffeine)",
    "visualizeButton": "הצג",
    "loadingButton": "טוען...",
    "suggestedMolecules": "מולקולות מוצעות:",
    "debugModeLabel": "מצב דיבאג:",
    "debugModeDescription": "הכנס נתוני JSON מולקולריים גולמיים למטה",
    "debugJsonPlaceholder": "הכנס נתוני JSON מולקולריים...",
    "renderJsonButton": "עבד JSON",
    "clearButton": "נקה",
    "formulaLabel": "נוסחה:",
    "atomsLabel": "אטומים:",
    "bondsLabel": "קשרים:",
    "welcomeIcon": "⚛️",
    "welcomeTitle": "הכנס שם מולקולה כדי להתחיל",
    "welcomeSubtitle": "נסה: מים (water), מתאן (methane), קפאין (caffeine), גלוקוז (glucose)",
    "loadingIcon": "⚛️",
    "loadingMessage": "משיג נתוני מולקולות מ-PubChem...",
    "controlsTitle": "בקרות:",
    "dragToRotate": "• גרור כדי לסובב",
    "scrollToZoom": "• גלול כדי להתקרב/התרחק",
    "errorFetchingMolecule": "שגיאה בהשגת נתוני מולקולה:",
    "invalidMolecularStructure": "מבנה נתוני מולקולה לא תקין",
    "invalidAtomStructure": "מבנה נתוני אטום לא תקין",
    "invalidElementsStructure": "מבנה נתוני יסודות לא תקין",
    "invalidBondData": "נתוני קשר לא תקינים - קשרים חייבים להתייחס למזהי אטום תקינים",
    "debugJsonError": "שגיאת JSON דיבאג:",
    "translatingText": "מתרגם מעברית...",
    "moleculeNotFound": "מולקולה לא נמצאה במסד הנתונים PubChem",
    "pubchemError": "שגיאה בחיבור למסד הנתונים PubChem",
    "compoundIdLabel": "PubChem CID:",
    "sourceLabel": "מקור: מסד נתונים PubChem"
  }
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale: string): string => {
  if (TRANSLATIONS[locale as keyof typeof TRANSLATIONS]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key: string): string => TRANSLATIONS[locale as keyof typeof TRANSLATIONS]?.[key as keyof typeof TRANSLATIONS['en-US']] || TRANSLATIONS['en-US'][key as keyof typeof TRANSLATIONS['en-US']] || key;

// Element data for visualization (CPK colors and van der Waals radii)
const ELEMENT_DATA = {
  'H': { color: '#FFFFFF', radius: 0.3 },
  'He': { color: '#D9FFFF', radius: 0.28 },
  'Li': { color: '#CC80FF', radius: 0.68 },
  'Be': { color: '#C2FF00', radius: 0.35 },
  'B': { color: '#FFB5B5', radius: 0.83 },
  'C': { color: '#909090', radius: 0.68 },
  'N': { color: '#3050F8', radius: 0.68 },
  'O': { color: '#FF0D0D', radius: 0.68 },
  'F': { color: '#90E050', radius: 0.64 },
  'Ne': { color: '#B3E3F5', radius: 0.58 },
  'Na': { color: '#AB5CF2', radius: 1.02 },
  'Mg': { color: '#8AFF00', radius: 0.86 },
  'Al': { color: '#BFA6A6', radius: 1.84 },
  'Si': { color: '#F0C8A0', radius: 1.76 },
  'P': { color: '#FF8000', radius: 1.06 },
  'S': { color: '#FFFF30', radius: 1.02 },
  'Cl': { color: '#1FF01F', radius: 0.99 },
  'Ar': { color: '#80D1E3', radius: 0.98 },
  'K': { color: '#8F40D4', radius: 1.38 },
  'Ca': { color: '#3DFF00', radius: 1.74 },
  'Sc': { color: '#E6E6E6', radius: 1.44 },
  'Ti': { color: '#BFC2C7', radius: 1.32 },
  'V': { color: '#A6A6AB', radius: 1.22 },
  'Cr': { color: '#8A99C7', radius: 1.18 },
  'Mn': { color: '#9C7AC7', radius: 1.17 },
  'Fe': { color: '#E06633', radius: 1.17 },
  'Co': { color: '#F090A0', radius: 1.16 },
  'Ni': { color: '#50D050', radius: 1.15 },
  'Cu': { color: '#C88033', radius: 1.17 },
  'Zn': { color: '#7D80B0', radius: 1.25 },
  'Ga': { color: '#C28F8F', radius: 1.26 },
  'Ge': { color: '#668F8F', radius: 1.22 },
  'As': { color: '#BD80E3', radius: 1.21 },
  'Se': { color: '#FFA100', radius: 1.16 },
  'Br': { color: '#A62929', radius: 1.14 },
  'Kr': { color: '#5CB8D1', radius: 1.12 },
  'Rb': { color: '#702EB0', radius: 1.48 },
  'Sr': { color: '#00FF00', radius: 1.92 },
  'Y': { color: '#94FFFF', radius: 1.62 },
  'Zr': { color: '#94E0E0', radius: 1.48 },
  'Nb': { color: '#73C2C9', radius: 1.37 },
  'Mo': { color: '#54B5B5', radius: 1.45 },
  'Tc': { color: '#3B9E9E', radius: 1.56 },
  'Ru': { color: '#248F8F', radius: 1.26 },
  'Rh': { color: '#0A7D8C', radius: 1.35 },
  'Pd': { color: '#006985', radius: 1.31 },
  'Ag': { color: '#C0C0C0', radius: 1.53 },
  'Cd': { color: '#FFD98F', radius: 1.48 },
  'In': { color: '#A67573', radius: 1.44 },
  'Sn': { color: '#668080', radius: 1.41 },
  'Sb': { color: '#9E63B5', radius: 1.38 },
  'Te': { color: '#D47A00', radius: 1.35 },
  'I': { color: '#940094', radius: 1.33 },
  'Xe': { color: '#429EB0', radius: 1.31 },
  'Cs': { color: '#57178F', radius: 1.67 },
  'Ba': { color: '#00C900', radius: 1.98 },
  'La': { color: '#70D4FF', radius: 1.69 },
  'Ce': { color: '#FFFFC7', radius: 1.65 },
  'Pr': { color: '#D9FFC7', radius: 1.65 },
  'Nd': { color: '#C7FFC7', radius: 1.64 },
  'Pm': { color: '#A3FFC7', radius: 1.63 },
  'Sm': { color: '#8FFFC7', radius: 1.62 },
  'Eu': { color: '#61FFC7', radius: 1.85 },
  'Gd': { color: '#45FFC7', radius: 1.61 },
  'Tb': { color: '#30FFC7', radius: 1.59 },
  'Dy': { color: '#1FFFC7', radius: 1.59 },
  'Ho': { color: '#00FF9C', radius: 1.58 },
  'Er': { color: '#00E675', radius: 1.57 },
  'Tm': { color: '#00D452', radius: 1.56 },
  'Yb': { color: '#00BF38', radius: 1.74 },
  'Lu': { color: '#00AB24', radius: 1.56 },
  'Hf': { color: '#4DC2FF', radius: 1.44 },
  'Ta': { color: '#4DA6FF', radius: 1.34 },
  'W': { color: '#2194D6', radius: 1.47 },
  'Re': { color: '#267DAB', radius: 1.60 },
  'Os': { color: '#266696', radius: 1.27 },
  'Ir': { color: '#175487', radius: 1.35 },
  'Pt': { color: '#D0D0E0', radius: 1.35 },
  'Au': { color: '#FFD123', radius: 1.50 },
  'Hg': { color: '#B8B8D0', radius: 1.52 },
  'Tl': { color: '#A6544D', radius: 1.45 },
  'Pb': { color: '#575961', radius: 1.47 },
  'Bi': { color: '#9E4FB5', radius: 1.46 },
  'Po': { color: '#AB5C00', radius: 1.53 },
  'At': { color: '#754F45', radius: 1.43 },
  'Rn': { color: '#428296', radius: 1.34 },
  'Fr': { color: '#420066', radius: 1.94 },
  'Ra': { color: '#007D00', radius: 2.01 },
  'Ac': { color: '#70ABFA', radius: 1.86 },
  'Th': { color: '#00BAFF', radius: 1.75 },
  'Pa': { color: '#00A1FF', radius: 1.69 },
  'U': { color: '#008FFF', radius: 1.70 },
  'Np': { color: '#0080FF', radius: 1.71 },
  'Pu': { color: '#006BFF', radius: 1.72 },
  'Am': { color: '#545CF2', radius: 1.66 },
  'Cm': { color: '#785CE3', radius: 1.66 },
  'Bk': { color: '#8A4FE3', radius: 1.68 },
  'Cf': { color: '#A136D4', radius: 1.68 },
  'Es': { color: '#B31FD4', radius: 1.65 },
  'Fm': { color: '#B31FBA', radius: 1.67 },
  'Md': { color: '#B30DA6', radius: 1.73 },
  'No': { color: '#BD0D87', radius: 1.76 },
  'Lr': { color: '#C70066', radius: 1.61 }
};

interface MoleculeData {
  formula: string;
  cid: number;
  elements: Record<string, any>;
  atoms: Array<{
    id: string;
    element: string;
    position: number[];
  }>;
  bonds: Array<{
    atom1: string;
    atom2: string;
    type: string;
  }>;
}

const App = () => {
  const [moleculeName, setMoleculeName] = useState<string>('');
  const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugJson, setDebugJson] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameId = useRef<number | null>(null);
  const rotationSpeed = useRef<number>(0.01);

  // Suggested molecules with Hebrew translations
  const suggestedMolecules = [
    { name: 'water', hebrew: 'מים', formula: 'H₂O' },
    { name: 'ammonia', hebrew: 'אמוניה', formula: 'NH₃' },
    { name: 'methane', hebrew: 'מתאן', formula: 'CH₄' },
    { name: 'ethylene', hebrew: 'אתילן', formula: 'C₂H₄' },
    { name: 'carbon dioxide', hebrew: 'פחמן דו-חמצני', formula: 'CO₂' },
    { name: 'caffeine', hebrew: 'קפאין', formula: 'C₈H₁₀N₄O₂' },
    { name: 'glucose', hebrew: 'גלוקוז', formula: 'C₆H₁₂O₆' }
  ];

  // Check if text contains Hebrew characters
  const isHebrew = (text: string): boolean => {
    return /[\u0590-\u05FF]/.test(text);
  };

  // Translate Hebrew to English using Google Translate
  const translateToEnglish = async (hebrewText: string): Promise<string> => {
    try {
      setIsTranslating(true);
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=he&tl=en&dt=t&q=${encodeURIComponent(hebrewText)}`);
      const data = await response.json();
      const translatedText = data[0][0][0];
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: try to find in suggestions
      const found = suggestedMolecules.find(mol => mol.hebrew === hebrewText);
      return found ? found.name : hebrewText;
    } finally {
      setIsTranslating(false);
    }
  };

  // Get compound CID from PubChem
  const getPubChemCID = async (moleculeName: string): Promise<number> => {
    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(moleculeName)}/cids/JSON`);
      if (!response.ok) {
        throw new Error(t('moleculeNotFound'));
      }
      const data = await response.json();
      return data.IdentifierList.CID[0];
    } catch (error) {
      throw new Error(t('moleculeNotFound'));
    }
  };

  // Get 3D structure from PubChem
  const getPubChem3DStructure = async (cid: number): Promise<MoleculeData> => {
    try {
      // Get compound properties
      const propsResponse = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula/JSON`);
      const propsData = await propsResponse.json();
      const formula = propsData.PropertyTable.Properties[0].MolecularFormula;

      // Get 3D coordinates (SDF format)
      const sdfResponse = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d&response_type=display`);
      if (!sdfResponse.ok) {
        throw new Error('3D structure not available');
      }
      const sdfData = await sdfResponse.text();
      
      return parseSDF(sdfData, formula, cid);
    } catch (error) {
      throw new Error(t('pubchemError'));
    }
  };

  // Parse SDF format to our molecule data structure
  const parseSDF = (sdfData: string, formula: string, cid: number): MoleculeData => {
    const lines = sdfData.split('\n');
    let atomCount = 0;
    let bondCount = 0;
    let atomsStartIndex = -1;
    
    // Find the counts line (usually line 3)
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.match(/^\s*\d+\s+\d+/)) {
        const parts = line.split(/\s+/);
        atomCount = parseInt(parts[0]);
        bondCount = parseInt(parts[1]);
        atomsStartIndex = i + 1;
        break;
      }
    }

    if (atomsStartIndex === -1 || atomCount === 0) {
      throw new Error('Invalid SDF format');
    }

    const atoms = [];
    const bonds = [];
    const usedElements = new Set();

    // Parse atoms
    for (let i = 0; i < atomCount; i++) {
      const line = lines[atomsStartIndex + i];
      if (!line) continue;
      
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        const element = parts[3];
        
        atoms.push({
          id: `${element}-${i + 1}`,
          element: element,
          position: [x, y, z]
        });
        
        usedElements.add(element);
      }
    }

    // Parse bonds
    const bondsStartIndex = atomsStartIndex + atomCount;
    for (let i = 0; i < bondCount; i++) {
      const line = lines[bondsStartIndex + i];
      if (!line) continue;
      
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const atom1Index = parseInt(parts[0]) - 1; // SDF uses 1-based indexing
        const atom2Index = parseInt(parts[1]) - 1;
        const bondType = parseInt(parts[2]);
        
        if (atom1Index >= 0 && atom1Index < atoms.length && 
            atom2Index >= 0 && atom2Index < atoms.length) {
          
          let type = 'single';
          if (bondType === 2) type = 'double';
          else if (bondType === 3) type = 'triple';
          
          bonds.push({
            atom1: atoms[atom1Index].id,
            atom2: atoms[atom2Index].id,
            type: type
          });
        }
      }
    }

    // Create elements object with only used elements
    const elements: Record<string, any> = {};
    usedElements.forEach(element => {
      const elementKey = element as string;
      const elementData = ELEMENT_DATA[elementKey as keyof typeof ELEMENT_DATA];
      if (elementData) {
        (elements as any)[elementKey] = {
          color: elementData.color,
          radius: elementData.radius * 0.5 // Scale down for better visualization
        };
      } else {
        // Default for unknown elements
        (elements as any)[elementKey] = {
          color: '#FF1493',
          radius: 0.5
        };
      }
    });

    return {
      formula,
      cid,
      elements,
      atoms,
      bonds
    };
  };

  const initializeScene = () => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    mountRef.current.appendChild(renderer.domElement);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Mouse controls
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const onMouseDown = (event: MouseEvent) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
      setAutoRotate(false);
    };
    
    const onMouseUp = () => {
      mouseDown = false;
    };
    
    const onMouseMove = (event: MouseEvent) => {
      if (!mouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      if (sceneRef.current) {
        sceneRef.current.rotation.y += deltaX * 0.01;
        sceneRef.current.rotation.x += deltaY * 0.01;
      }
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const onWheel = (event: WheelEvent) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(50, camera.position.z));
    };
    
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);
    
    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      
      if (autoRotate && sceneRef.current) {
        sceneRef.current.rotation.y += rotationSpeed.current;
      }
      
      renderer.render(scene, camera);
    };
    animate();
  };

  const clearScene = () => {
    if (!sceneRef.current) return;
    
    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh && child.userData.isAtomOrBond) {
        objectsToRemove.push(child);
      }
    });
    
    objectsToRemove.forEach((obj) => {
      if (sceneRef.current) {
        sceneRef.current.remove(obj);
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
  };

  const renderMolecule = (data: MoleculeData) => {
    if (!sceneRef.current) return;
    
    clearScene();
    
    const atomMap = new Map();
    
    // Create atoms
    data.atoms.forEach((atom) => {
      const elementInfo = data.elements[atom.element];
      if (!elementInfo) {
        console.warn(`No element info found for ${atom.element}`);
        return;
      }
      
      const color = parseInt(elementInfo.color.replace('#', '0x'));
      const radius = elementInfo.radius;
      const [x, y, z] = atom.position;
      
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshLambertMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.userData = { isAtomOrBond: true, atomId: atom.id, element: atom.element };
      
      if (sceneRef.current) {
        sceneRef.current.add(sphere);
      }
      atomMap.set(atom.id, atom);
    });
    
    // Create bonds
    data.bonds.forEach((bond) => {
      const atom1 = atomMap.get(bond.atom1);
      const atom2 = atomMap.get(bond.atom2);
      
      if (!atom1 || !atom2) {
        console.warn(`Bond references invalid atom IDs: ${bond.atom1}, ${bond.atom2}`);
        return;
      }
      
      const start = new THREE.Vector3(...atom1.position);
      const end = new THREE.Vector3(...atom2.position);
      const direction = new THREE.Vector3().subVectors(end, start);
      const distance = direction.length();
      
      if (bond.type === 'single') {
        const geometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder = new THREE.Mesh(geometry, material);
        
        cylinder.position.copy(start).add(end).divideScalar(2);
        cylinder.lookAt(end);
        cylinder.rotateX(Math.PI / 2);
        cylinder.userData = { isAtomOrBond: true };
        if (sceneRef.current) {
          sceneRef.current.add(cylinder);
        }
        
      } else if (bond.type === 'double') {
        const offset = 0.1;
        let perpendicular;
        if (Math.abs(direction.y) < 0.9) {
          perpendicular = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
        } else {
          perpendicular = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
        }
        perpendicular.multiplyScalar(offset);
        
        const geometry1 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material1 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder1 = new THREE.Mesh(geometry1, material1);
        
        const midpoint = new THREE.Vector3().copy(start).add(end).divideScalar(2);
        cylinder1.position.copy(midpoint).add(perpendicular);
        cylinder1.lookAt(end);
        cylinder1.rotateX(Math.PI / 2);
        cylinder1.userData = { isAtomOrBond: true };
        if (sceneRef.current) {
          sceneRef.current.add(cylinder1);
        }
        
        const geometry2 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material2 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder2 = new THREE.Mesh(geometry2, material2);
        
        cylinder2.position.copy(midpoint).sub(perpendicular);
        cylinder2.lookAt(end);
        cylinder2.rotateX(Math.PI / 2);
        cylinder2.userData = { isAtomOrBond: true };
        if (sceneRef.current) {
          sceneRef.current.add(cylinder2);
        }
        
      } else if (bond.type === 'triple') {
        const offset = 0.08;
        
        let perpendicular1: THREE.Vector3;
        if (Math.abs(direction.y) < 0.9) {
          perpendicular1 = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
        } else {
          perpendicular1 = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
        }
        
        const midpoint = new THREE.Vector3().copy(start).add(end).divideScalar(2);
        
        // Center cylinder
        const geometry1 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material1 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder1 = new THREE.Mesh(geometry1, material1);
        
        cylinder1.position.copy(midpoint);
        cylinder1.lookAt(end);
        cylinder1.rotateX(Math.PI / 2);
        cylinder1.userData = { isAtomOrBond: true };
        if (sceneRef.current) {
          sceneRef.current.add(cylinder1);
        }
        
        // Second cylinder
        const geometry2 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material2 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder2 = new THREE.Mesh(geometry2, material2);
        
        cylinder2.position.copy(midpoint).add(perpendicular1.clone().multiplyScalar(offset));
        cylinder2.lookAt(end);
        cylinder2.rotateX(Math.PI / 2);
        cylinder2.userData = { isAtomOrBond: true };
        if (sceneRef.current) {
          sceneRef.current.add(cylinder2);
        }
        
        // Third cylinder
        const geometry3 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material3 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder3 = new THREE.Mesh(geometry3, material3);
        
        cylinder3.position.copy(midpoint).sub(perpendicular1.clone().multiplyScalar(offset));
        cylinder3.lookAt(end);
        cylinder3.rotateX(Math.PI / 2);
        cylinder3.userData = { isAtomOrBond: true };
        if (sceneRef.current) {
          sceneRef.current.add(cylinder3);
        }
      }
    });
    
    // Center the molecule and fit to view
    const box = new THREE.Box3().setFromObject(sceneRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the molecule
    if (sceneRef.current) {
      sceneRef.current.position.sub(center);
    }
    
    // Calculate optimal camera distance
    if (cameraRef.current) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current.fov * (Math.PI / 180);
      const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.5;
      
      // Set camera position
      cameraRef.current.position.set(0, 0, Math.max(distance, 3));
      cameraRef.current.lookAt(0, 0, 0);
    }
    
    // Start auto-rotation
    setAutoRotate(true);
  };

  const fetchMoleculeData = async (name: string): Promise<void> => {
    setLoading(true);
    setError('');
    
    try {
      let searchName = name.trim();
      
      // Translate if Hebrew
      if (isHebrew(searchName)) {
        searchName = await translateToEnglish(searchName);
      }
      
      // Get CID from PubChem
      const cid = await getPubChemCID(searchName);
      
      // Get 3D structure
      const moleculeData = await getPubChem3DStructure(cid);
      
      setMoleculeData(moleculeData);
      renderMolecule(moleculeData);
    } catch (error) {
      setError(`${t('errorFetchingMolecule')} ${(error as Error).message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moleculeName.trim()) {
      fetchMoleculeData(moleculeName.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: { name: string; hebrew: string; formula: string }) => {
    setMoleculeName(suggestion.name);
    setShowSuggestions(false);
    fetchMoleculeData(suggestion.name);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleDebugSubmit = () => {
    try {
      const parsedData = JSON.parse(debugJson);
      
      if (!parsedData.formula || !parsedData.elements || !parsedData.atoms || !parsedData.bonds) {
        throw new Error(t('invalidMolecularStructure'));
      }
      
      setMoleculeData(parsedData);
      renderMolecule(parsedData);
      setError('');
    } catch (error) {
      setError(`${t('debugJsonError')} ${(error as Error).message}`);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    setError('');
    if (!debugMode) {
      setDebugJson(`{
  "formula": "H2O",
  "elements": {
    "H": {
      "radius": 0.3,
      "color": "#FFFFFF"
    },
    "O": {
      "radius": 0.6,
      "color": "#FF0D0D"
    }
  },
  "atoms": [
    {
      "id": "O-1",
      "element": "O",
      "position": [0.0, 0.0, 0.0]
    },
    {
      "id": "H-1",
      "element": "H",
      "position": [0.757, 0.586, 0.0]
    },
    {
      "id": "H-2",
      "element": "H",
      "position": [-0.757, 0.586, 0.0]
    }
  ],
  "bonds": [
    {
      "atom1": "O-1",
      "atom2": "H-1",
      "type": "single"
    },
    {
      "atom1": "O-1",
      "atom2": "H-2",
      "type": "single"
    }
  ]
}`);
    }
  };

  useEffect(() => {
    initializeScene();
    
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current && mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-light text-gray-900">{t('appTitle')}</h1>
            <button
              onClick={toggleDebugMode}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                debugMode 
                  ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {debugMode ? t('debugModeButton') : t('debugButton')}
            </button>
          </div>
          
          {!debugMode ? (
            <div className="relative">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={moleculeName}
                  onChange={(e) => setMoleculeName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('moleculeInputPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading || !moleculeName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? t('loadingButton') : t('visualizeButton')}
                </button>
              </div>
              
              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                    {t('suggestedMolecules')}
                  </div>
                  {suggestedMolecules.map((molecule) => (
                    <button
                      key={molecule.name}
                      onClick={() => handleSuggestionClick(molecule)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize text-gray-900">{molecule.name}</span>
                        <span className="text-gray-500">({molecule.hebrew})</span>
                      </div>
                      <span className="text-xs text-gray-500">{molecule.formula}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-orange-700">
                <span className="font-medium">{t('debugModeLabel')}</span>
                <span>{t('debugModeDescription')}</span>
              </div>
              <textarea
                value={debugJson}
                onChange={(e) => setDebugJson(e.target.value)}
                placeholder={t('debugJsonPlaceholder')}
                className="w-full h-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                style={{ resize: 'vertical' }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDebugSubmit}
                  disabled={!debugJson.trim()}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {t('renderJsonButton')}
                </button>
                <button
                  onClick={() => setDebugJson('')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t('clearButton')}
                </button>
              </div>
            </div>
          )}
          
          {isTranslating && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
              {t('translatingText')}
            </div>
          )}
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {moleculeData && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">{t('formulaLabel')}</span> {moleculeData.formula} • 
              <span className="font-medium"> {t('atomsLabel')}</span> {moleculeData.atoms.length} • 
              <span className="font-medium"> {t('bondsLabel')}</span> {moleculeData.bonds.length}
              {moleculeData.cid && (
                <>
                  {' • '}
                  <span className="font-medium">{t('compoundIdLabel')}</span> {moleculeData.cid}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />
        
        {!moleculeData && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">{t('welcomeIcon')}</div>
              <p className="text-xl font-light">{t('welcomeTitle')}</p>
              <p className="text-sm mt-2">{t('welcomeSubtitle')}</p>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">{t('loadingIcon')}</div>
              <p className="text-lg text-gray-600">{t('loadingMessage')}</p>
            </div>
          </div>
        )}
        
        {moleculeData && (
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">{t('controlsTitle')}</p>
            <p>{t('dragToRotate')}</p>
            <p>{t('scrollToZoom')}</p>
            <p className="mt-2 text-xs text-gray-500">{t('sourceLabel')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;