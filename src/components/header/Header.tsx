import { useState } from "react";
import { Burger, Container, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Header.module.css";

export type Link = {
  link: string;
  label: string;
};

type HeaderProps = {
  title: string;
  links: Link[];
};

const Header = (props: HeaderProps) => {
  const { title, links = [] } = props;
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0]?.link);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group className={classes.leftGroup}>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
          <Title order={2}>{title}</Title>
        </Group>
        <Container className={classes.rightContainer} size="lg">
          <Group gap={5} visibleFrom="xs" className={classes.rightGroup}>
            {items}
          </Group>
        </Container>
      </div>
    </header>
  );
};

export default Header;
