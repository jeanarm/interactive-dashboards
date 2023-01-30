import { Stack, Text } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { TreeSelect, Tree } from "antd";
import { GroupBase, Select } from "chakra-react-select";
import { useLiveQuery } from "dexie-react-hooks";
import { useStore } from "effector-react";
import { flatten } from "lodash";
import React, { useState } from "react";
import { db } from "../db";
import { setGroups, setLevels } from "../Events";
import { DataNode, Option } from "../interfaces";
import { $store } from "../Store";
import arrayToTree from "array-to-tree";

const OUTree = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const store = useStore($store);
  const engine = useDataEngine();
  const organisations = useLiveQuery(() => db.organisations.toArray());
  const levels = useLiveQuery(() => db.levels.toArray());
  const groups = useLiveQuery(() => db.groups.toArray());
  const expandedKeys = useLiveQuery(() => db.expandedKeys.get("1"));
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  const [checkedKeys, setCheckedKeys] = useState<
    { checked: React.Key[]; halfChecked: React.Key[] } | React.Key[]
  >(() => {
    return { checked: value, halfChecked: [] };
  });

  const onLoadData = async ({ id, children }: any) => {
    if (children) {
      return;
    }
    try {
      const {
        units: { organisationUnits },
      }: any = await engine.query({
        units: {
          resource: "organisationUnits.json",
          params: {
            filter: `id:in:[${id}]`,
            paging: "false",
            order: "shortName:desc",
            fields: "children[id,name,path,leaf]",
          },
        },
      });
      const found = organisationUnits.map((unit: any) => {
        return unit.children
          .map((child: any) => {
            return {
              id: child.id,
              pId: id,
              value: child.id,
              title: child.name,
              isLeaf: child.leaf,
            };
          })
          .sort((a: any, b: any) => {
            if (a.title > b.title) {
              return 1;
            }
            if (a.title < b.title) {
              return -1;
            }
            return 0;
          });
      });
      await db.organisations.bulkPut(flatten(found));
    } catch (e) {
      console.log(e);
    }
  };
  const onExpand = async (expandedKeysValue: React.Key[]) => {
    await db.expandedKeys.put({ id: "1", name: expandedKeysValue.join(",") });
    setAutoExpandParent(false);
  };

  const onCheck = async (
    checkedKeysValue:
      | { checked: React.Key[]; halfChecked: React.Key[] }
      | React.Key[]
  ) => {
    let allChecked = [];
    if (Array.isArray(checkedKeysValue)) {
      allChecked = checkedKeysValue;
    } else {
      allChecked = checkedKeysValue.checked;
    }
    setCheckedKeys(checkedKeysValue);
    onChange(allChecked.map((val) => String(value)));
  };
  return (
    <Stack bgColor="white" spacing="20px">
      {/* <TreeSelect<string | string[] | undefined>
        size="large"
        allowClear={true}
        treeDataSimpleMode
        multiple={true}
        style={{ width: "100%" }}
        value={value}
        listHeight={700}
        dropdownStyle={{ overflow: "auto" }}
        treeExpandedKeys={expanded?.map(({ id }) => id)}
        onTreeExpand={onTreeExpand}
        placeholder="Please select organisation unit"
        onChange={onChange}
        loadData={onLoadData}
        treeData={organisations}
      /> */}

      <Tree
        checkable
        onExpand={onExpand}
        checkStrictly
        expandedKeys={expandedKeys?.name.split(",") || []}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        // onSelect={onSelect}
        // selectedKeys={selectedKeys}
        loadData={onLoadData}
        style={{
          maxHeight: "500px",
          overflow: "auto",
          fontSize: "18px",
        }}
        treeData={
          organisations
            ? arrayToTree(organisations, { parentProperty: "pId" })
            : []
        }
      />
      <Stack zIndex={300}>
        <Text>Level</Text>
        <Select<Option, true, GroupBase<Option>>
          isMulti
          options={levels}
          value={levels?.filter(
            (d: Option) => store.levels.indexOf(d.value) !== -1
          )}
          onChange={(e) => {
            setLevels(e.map((ex) => ex.value));
          }}
        />
      </Stack>
      <Stack zIndex={200}>
        <Text>Group</Text>
        <Select<Option, true, GroupBase<Option>>
          isMulti
          options={groups}
          value={groups?.filter(
            (d: Option) => store.groups.indexOf(d.value) !== -1
          )}
          onChange={(e) => {
            setGroups(e.map((ex) => ex.value));
          }}
        />
      </Stack>
    </Stack>
  );
};

export default OUTree;
