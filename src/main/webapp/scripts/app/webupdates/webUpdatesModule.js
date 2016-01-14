angular.module('webUpdates', ['dbWebApp'])
    .constant(
    'STATE', {
        CREATE: 'webupdates.create',
        SELECT: 'webupdates.select',
        MODIFY: 'webupdates.modify',
        DELETE: 'webupdates.delete',
        DISPLAY: 'webupdates.display',
        FORCE_DELETE: 'webupdates.forceDelete',
        FORCE_DELETE_SELECT: 'webupdates.forceDeleteSelect'
    });
