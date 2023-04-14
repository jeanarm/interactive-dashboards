import { Text, Stack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { useDashboards } from "../Queries";
import { $categoryOptions, $store } from "../Store";
import DashboardTree from "./DashboardTree";
import LoadingIndicator from "./LoadingIndicator";
import { groupBy } from "lodash";
import NavItem from "./NavItem";

export default function DashboardList() {
    const store = useStore($store);
    const { isLoading, isSuccess, isError, error, data } = useDashboards(
        store.systemId
    );
    const categoryOptions = useStore($categoryOptions);

    return (
        <>
            {isLoading && <LoadingIndicator />}
            {isSuccess && (
                <Stack spacing="40px" p="5px">
                    {categoryOptions
                        .map((category) => {
                            const groupedDashboards = groupBy(data, "category");
                            return {
                                ...category,
                                dashboards:
                                    groupedDashboards[category.value] || [],
                            };
                        })
                        .filter(({ dashboards }) => dashboards.length > 0)
                        .map((value) => {
                            return <NavItem option={value} key={value.value} />;
                        })}
                </Stack>
                // <DashboardTree />
            )}

            {isError && <Text>No data/Error occurred</Text>}
        </>
    );
}
