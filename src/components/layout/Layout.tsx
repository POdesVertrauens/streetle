import type { ReactNode } from "react";
import Header, { type Link } from "../header/Header";
import { Container } from "@mantine/core";
import styles from "./layout.module.css";

type LayoutProps = {
  children: ReactNode;
};

const links: Link[] = [];

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header links={links} title="Streetle" />
      <Container className={styles.container} size="lg">
        {children}
      </Container>
    </>
  );
};

export default Layout;
