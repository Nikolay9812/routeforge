import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import type { ComponentProps, ComponentType } from "react";

cssInterop(MaterialCommunityIcons, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
    },
  },
});

type MaterialIconProps = ComponentProps<typeof MaterialCommunityIcons>;

type StyledMaterialIconProps = MaterialIconProps & {
  className?: string;
};

const StyledMaterialCommunityIcons =
  MaterialCommunityIcons as ComponentType<StyledMaterialIconProps>;

export type RfIconName = MaterialIconProps["name"];

type RfIconProps = {
  className?: string;
  name: RfIconName;
  size?: number;
};

export function RfIcon({ className, name, size = 24 }: RfIconProps) {
  return <StyledMaterialCommunityIcons className={className} name={name} size={size} />;
}
