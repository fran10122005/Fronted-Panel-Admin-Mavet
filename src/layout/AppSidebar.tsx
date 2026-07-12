import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  CalenderIcon,
  ChevronDownIcon,
  DocsIcon,
  GridIcon,
  ListIcon,
  PageIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <ListIcon />,
    name: "Recepción",
    path: "/recepcion",
  },
  {
    icon: <PageIcon />,
    name: "Biblioteca",
    path: "/biblioteca",
  },
  {
    icon: <PageIcon />,
    name: "Talleres",
    path: "/talleres",
  },
  {
    icon: <CalenderIcon />,
    name: "Auditorio",
    path: "/auditorio",
  },
  {
    icon: <TableIcon />,
    name: "Inventario de Bóveda",
    path: "/inventario-obras",
  },
  {
    icon: <UserCircleIcon />,
    name: "Recursos Humanos",
    path: "/rrhh",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <DocsIcon />,
    name: "Manual de Usuario",
    path: "/manual",
  },
  {
    icon: <PlugInIcon />,
    name: "Cerrar Sesión",
    path: "/signin",
  },
];

const routePermissions: Record<string, string[]> = {
  "/": ["*"],
  "/auditorio": ["Administrador", "admin", "Gerente", "Educador", "Educación"],
  "/recepcion": ["Administrador", "admin", "Gerente", "Recepcionista"],
  "/talleres": ["Administrador", "admin", "Gerente", "Educador", "Educación"],
  "/inventario-obras": ["Administrador", "admin", "Gerente", "Curador", "Restaurador"],
  "/biblioteca": ["Administrador", "admin", "Gerente", "Bibliotecario", "Bibliotecaria"],
  "/rrhh": ["Administrador", "admin", "Gerente"],
  "/asistencia": ["*"],
  "/papelera": ["Administrador", "admin"],
  "/manual": ["*"],
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const { logout, user } = useAuth();
  const location = useLocation();

  // Agregamos fallbacks en caso de que el objeto user antiguo en localStorage no tenga .Role
  const userRole = user?.Role?.nombre_rol || user?.rol || "Administrador";

  const filteredNavItems = useCallback(() => {
    if (userRole === "Administrador" || userRole === "admin") return navItems;
    return navItems.filter((item) => {
      const allowedRoles = routePermissions[item.path || ""] || [];
      if (allowedRoles.includes("*")) return true;
      return allowedRoles.includes(userRole);
    });
  }, [userRole])();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              nav.name === "Cerrar Sesión" ? (
              <button
                onClick={() => {
                  logout();
                  if (isMobileOpen) toggleMobileSidebar();
                }}
                className={`w-full menu-item group menu-item-logout ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
              >
                  <span className="menu-item-icon-size">
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </button>
              ) : (
                <Link
                  to={nav.path}
                  onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
                  className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                    } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span
                    className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
          )}
          </Link>
               )
             )
           )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
        </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed flex flex-col top-0 px-5 left-0 aside-gradient dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out ${isMobileOpen ? "z-[999999]" : "z-50"} border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[250px]"
          : isHovered
            ? "w-[250px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="py-6 flex flex-col items-center justify-center w-full border-b border-gray-200 dark:border-gray-800"
      >
        <button onClick={() => { if (isMobileOpen) toggleMobileSidebar(); window.location.reload(); }} className="flex flex-col items-center justify-center w-full px-2 cursor-pointer">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex flex-col items-center justify-center w-full text-center">
              <img
                src="/images/logo/mavet2.png"
                alt="Logo MAVET"
                className="h-16 w-auto object-contain mb-3 flex-shrink-0"
              />
              <span
                className="text-[16px] text-gray-900 dark:text-gray-100 leading-snug font-bold drop-shadow-sm block text-center"
                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700 }}
              >
                Museo de Artes Visuales y Espacios del Táchira
              </span>
            </div>
          ) : (
            <img
              src="/images/logo/mavet2.png"
              alt="Logo MAVET"
              className="w-10 h-10 object-contain mx-auto"
            />
          )}
        </button>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mt-4 mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            <hr className="border-gray-200 dark:border-gray-800" />
            <div>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
