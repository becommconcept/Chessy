import { basculerUtilisateur, enregistrerUtilisateur, supprimerUtilisateur } from "@/app/admin/actions-config";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, Cell, DataTable, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Notice, Select } from "@/components/ui/Field";
import { getSessionUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/enums";
import { formatRelative, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comptes utilisateurs" };

const ERRORS: Record<string, string> = {
  champs: "Le nom et l'adresse électronique sont obligatoires.",
  role: "Le rôle choisi n'est pas valide.",
  courriel: "Cette adresse électronique est déjà utilisée par un autre compte.",
  motdepasse: "Le mot de passe doit comporter au moins 10 caractères.",
};

type Props = { searchParams: Promise<{ modifier?: string; erreur?: string; enregistre?: string }> };

export default async function AdminUtilisateursPage({ searchParams }: Props) {
  await requireRole(["ADMIN"], "/admin/utilisateurs");

  const [{ modifier, erreur, enregistre }, current] = await Promise.all([
    searchParams,
    getSessionUser(),
  ]);

  const editing = modifier && modifier !== "nouveau" ? modifier : null;

  const [users, target] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        job: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    editing ? prisma.user.findUnique({ where: { id: editing } }) : Promise.resolve(null),
  ]);

  return (
    <>
      <AdminHeader
        title="Comptes utilisateurs"
        description="Chaque agent ou élu disposant d'un accès au back-office a son propre compte. Les actions sont journalisées nominativement."
        breadcrumb={[{ label: "Comptes utilisateurs" }]}
        actions={
          <ButtonLink href="/admin/utilisateurs?modifier=nouveau" size="sm" icon="Plus">
            Créer un compte
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          Le compte a bien été enregistré.
        </Notice>
      ) : null}

      {erreur ? (
        <Notice tone="erreur" title="Le compte n'a pas pu être enregistré" className="mb-5">
          {ERRORS[erreur] ?? "Vérifiez les informations saisies."}
        </Notice>
      ) : null}

      <HelpNote title="Les trois rôles" icon="ShieldCheck">
        <ul className="mt-1.5 space-y-1">
          {ROLES.map((role) => (
            <li key={role}>
              <strong>{ROLE_LABELS[role]}</strong> — {ROLE_DESCRIPTIONS[role]}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          Accordez le rôle le plus restreint qui permette de travailler : un agent d'accueil n'a
          pas besoin de pouvoir modifier les pages du site.
        </p>
      </HelpNote>

      {modifier ? (
        <Panel
          className="mt-5 mb-6"
          title={target ? `Modifier le compte de ${target.name}` : "Créer un compte"}
          actions={
            <ButtonLink href="/admin/utilisateurs" variant="discret" size="sm" icon="X">
              Fermer
            </ButtonLink>
          }
        >
          <form action={enregistrerUtilisateur} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <input type="hidden" name="id" value={target?.id ?? ""} />

            <Field label="Nom et prénom" htmlFor="nom" required>
              <Input id="nom" name="nom" defaultValue={target?.name ?? ""} required maxLength={120} />
            </Field>

            <Field label="Adresse électronique" htmlFor="courriel" required hint="Sert d'identifiant de connexion.">
              <Input
                id="courriel"
                name="courriel"
                type="email"
                defaultValue={target?.email ?? ""}
                required
                autoComplete="off"
              />
            </Field>

            <Field label="Fonction" htmlFor="fonction" hint="Exemple : secrétaire générale, agent d'accueil.">
              <Input id="fonction" name="fonction" defaultValue={target?.job ?? ""} maxLength={120} />
            </Field>

            <Field label="Rôle" htmlFor="role" required>
              <Select
                id="role"
                name="role"
                defaultValue={target?.role ?? "EDITEUR"}
                disabled={target?.id === current?.id}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Mot de passe"
              htmlFor="motdepasse"
              required={!target}
              hint={
                target
                  ? "Laissez vide pour conserver le mot de passe actuel. 10 caractères minimum."
                  : "10 caractères minimum. Communiquez-le par un canal distinct du courriel."
              }
              className="sm:col-span-2"
            >
              <Input
                id="motdepasse"
                name="motdepasse"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required={!target}
              />
            </Field>

            <div className="sm:col-span-2">
              <Checkbox
                name="actif"
                defaultChecked={target?.active ?? true}
                label="Compte actif"
                description="Un compte désactivé ne peut plus se connecter, mais ses contributions restent en place."
                disabled={target?.id === current?.id}
              />
            </div>

            <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
              <SubmitButton icon="Save">Enregistrer le compte</SubmitButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel className="mt-5">
        <DataTable
          caption="Liste des comptes du back-office"
          columns={[
            { label: "Utilisateur" },
            { label: "Rôle" },
            { label: "Dernière connexion" },
            { label: "État" },
            { label: "Actions", sr: true },
          ]}
        >
          {users.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
              <Cell header>
                <span className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-azur-100 text-xs font-bold text-azur-700 dark:bg-azur-900 dark:text-azur-200">
                    {initials(user.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {user.name}
                      {user.id === current?.id ? (
                        <span className="ml-1.5 text-xs font-normal text-[color:var(--texte-doux)]">
                          (vous)
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-[color:var(--texte-doux)]">
                      {user.email}
                      {user.job ? ` · ${user.job}` : ""}
                    </span>
                  </span>
                </span>
              </Cell>
              <Cell>
                <Pill tone={user.role === "ADMIN" ? "attente" : "neutre"}>
                  {ROLE_LABELS[user.role as Role]}
                </Pill>
              </Cell>
              <Cell className="text-xs text-[color:var(--texte-doux)]">
                {user.lastLoginAt ? formatRelative(user.lastLoginAt) : "jamais connecté"}
              </Cell>
              <Cell>
                {user.active ? <Pill tone="publie">Actif</Pill> : <Pill tone="brouillon">Désactivé</Pill>}
              </Cell>
              <Cell className="text-right">
                <RowActions
                  editHref={`/admin/utilisateurs?modifier=${user.id}`}
                  items={
                    user.id === current?.id
                      ? []
                      : [
                          {
                            label: user.active ? "Désactiver" : "Réactiver",
                            icon: user.active ? "Lock" : "KeyRound",
                            action: basculerUtilisateur.bind(null, user.id),
                          },
                          {
                            label: "Supprimer le compte",
                            icon: "Trash2",
                            danger: true,
                            confirm: `Supprimer définitivement le compte de ${user.name} ? Ses contributions restent publiées, mais l'accès est immédiatement révoqué.`,
                            action: supprimerUtilisateur.bind(null, user.id),
                          },
                        ]
                  }
                />
              </Cell>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <HelpNote title="Avant la mise en production" icon="ShieldAlert">
        Modifiez impérativement les mots de passe des trois comptes de démonstration livrés avec le
        site, et supprimez ceux qui ne correspondent à personne. Un mot de passe long et unique par
        compte, jamais partagé entre agents : le journal d'audit n'a de valeur que si chaque action
        est rattachable à une personne.
      </HelpNote>
    </>
  );
}
