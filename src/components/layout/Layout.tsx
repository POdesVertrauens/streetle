import type { ReactNode } from "react";
import Header, { type Link } from "../header/Header";
import { Container } from "@mantine/core";

type LayoutProps = {
  children: ReactNode;
};

const links: Link[] = [];

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header links={links} title="Streetle" />
      <Container size="lg">{children}</Container>
    </>
  );
};

export default Layout;
