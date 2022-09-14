import { groupBy } from "lodash";
import { useState } from "react";

import { Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-location";
import { useStore } from "effector-react";
import { $dashboard, $dashboards, $store } from "../Store";

import { Option } from "../interfaces";

interface NavItemProps {
  // icon: IconType;
  option: Option;
}
const NavItem = ({ option: { label, value } }: NavItemProps) => {
  const navigate = useNavigate();
  const store = useStore($store);
  const dashboards = groupBy(useStore($dashboards), "category");
  const dashboard = useStore($dashboard);
  const [active, setActive] = useState<string>("title");
  const toggle = (id: string) => {
    if (active === id) {
      setActive("");
    } else {
      setActive(id);
    }
  };

  const getDashboards = (category: string) => {
    return dashboards[category] || [];
  };
  const categoryDashboards = getDashboards(value);
  return (
    <Stack
      cursor="pointer"
      key={value}
      onClick={() => {
        toggle(value);

        if (categoryDashboards.length > 0) {
          navigate({
            to: `/dashboards/${categoryDashboards[0].id}`,
            search: {
              category: value,
              periods: store.periods.map((i) => i.id),
              organisations: store.organisations,
              groups: store.groups,
              levels: store.levels,
            },
          });
        }
      }}
    >
      <Text fontSize="md" fontWeight="bold" textTransform="uppercase">
        {label}
      </Text>
      {active === value && (
        <Stack pl="20px" w="100%">
          {categoryDashboards.map((d) => (
            <Text
              bg={dashboard.id === d.id ? "blue.50" : ""}
              onClick={(e) => {
                e.stopPropagation();
                navigate({
                  to: `/dashboards/${d.id}`,
                  search: {
                    category: value,
                    periods: store.periods.map((i) => i.id),
                    organisations: store.organisations,
                    groups: store.groups,
                    levels: store.levels,
                  },
                });
              }}
            >
              {d.name}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default NavItem;
