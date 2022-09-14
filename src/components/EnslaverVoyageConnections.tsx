import { Tree, TreeDragDropParams } from 'primereact/tree';
import { EnslaverAlias, EnslaverContribution, EnslaverContributionType, EnslaverIdentity } from '../models/EnslaverContribution';
import TreeNode from 'primereact/treenode';

interface IEnslaverVoyageConnectionsProps {
    contribution: EnslaverContribution,
    onUpdate: (updated: EnslaverContribution) => void
}

const EnslaverVoyageConnections = (props: IEnslaverVoyageConnectionsProps) => {
    const contrib = props.contribution;
    const makeAliasNodes: (alias: EnslaverAlias) => TreeNode[] = alias =>
        alias.voyages.map(
            v => ({
                key: `voyage_${v.id}`,
                label: `Voyage ${v.id} ship '${v.ship_name}' from ...`,
                data: v,
                draggable: true,
                droppable: false
            })
        );
    const makeIdentityNodes: (identity: EnslaverIdentity) => TreeNode[] = identity =>
        identity.aliases.map(
            alias => ({
                key: `alias_${alias.id}`,
                label: alias.alias,
                data: alias,
                children: makeAliasNodes(alias),
                draggable: contrib.type === EnslaverContributionType.Split,
                droppable: true,
                expanded: true,
            })
        );
    const nodes = [];
    if (contrib.type === EnslaverContributionType.Split) {
        // This is the only case where we need to explicitly show the identities
        // (two of them).
        for (const eid of contrib.identities) {
            const enode: TreeNode = {
                key: `identity_${eid.id}`,
                label: eid.personal_data.primary_alias,
                data: eid,
                children: makeIdentityNodes(eid),
                droppable: true,
                expanded: true
            };
            nodes.push(enode);
        }
    }
    const handleDragDrop = (e: TreeDragDropParams) => {
        // TODO
        if ((typeof e.dragNode.key === 'string') && (typeof e.dropNode.key === 'string')) {
            if (e.dragNode.key.startsWith("voyage") && e.dropNode.key.startsWith("alias")) {
                // Create an updated version of the contribution and call
                // props.onUpdate()
            }
            if (e.dragNode.key.startsWith("alias") && e.dropNode.key.startsWith("identity")) {
            }
        }
    };
    // TODO:
    // - Keep state for selection, ensure only allowed multiple selection of voyages.
    // - Button for adding a new alias
    // - Button for deleting an alias.
    return <Tree value={nodes} onDragDrop={handleDragDrop} selectionMode="multiple" />
}

export default EnslaverVoyageConnections;